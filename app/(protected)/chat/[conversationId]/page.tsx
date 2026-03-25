"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useParams, useSearchParams } from "next/navigation";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { Conversation, Message as DBMessage } from "@/lib/types";

function getTextContent(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text)
    .join("");
}

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const conversationId = params.conversationId as string;
  const isInitial = searchParams.get("initial") === "true";

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [initialMessages, setInitialMessages] = useState<DBMessage[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Load conversation and messages
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [convRes, msgsRes] = await Promise.all([
          fetch(`/api/conversations/${conversationId}`),
          fetch(`/api/messages?conversationId=${conversationId}`),
        ]);

        if (convRes.ok) {
          setConversation(await convRes.json());
        }
        if (msgsRes.ok) {
          setInitialMessages(await msgsRes.json());
        }
      } catch (err) {
        console.error("Failed to load conversation:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [conversationId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p style={{ color: "var(--muted)" }}>Loading conversation...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p style={{ color: "var(--muted)" }}>Conversation not found.</p>
      </div>
    );
  }

  return (
    <ActiveChat
      conversation={conversation}
      initialMessages={initialMessages || []}
      isInitial={isInitial}
    />
  );
}

function ActiveChat({
  conversation,
  initialMessages,
  isInitial,
}: {
  conversation: Conversation;
  initialMessages: DBMessage[];
  isInitial: boolean;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const initialSent = useRef(false);

  const {
    messages,
    sendMessage,
    status,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        provider: conversation.provider,
        model: conversation.model,
      },
    }),
    onFinish: async ({ message }) => {
      const content = getTextContent(message.parts);
      if (content) {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: conversation.id,
            role: "assistant",
            content,
          }),
        });
      }
    },
    onError: (err) => {
      console.error("Chat stream error:", err);
      setError(err.message || "Failed to get response from LLM");
    },
  });

  const isStreaming = status === "streaming" || status === "submitted";

  // For initial conversations: DON'T pre-set messages, let sendMessage handle it
  // For existing conversations: load all messages from DB
  useEffect(() => {
    if (isInitial) return; // sendMessage will add the user message itself
    if (initialMessages.length > 0) {
      const chatMessages = initialMessages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant" | "system",
        parts: [{ type: "text" as const, text: m.content }],
      }));
      setMessages(chatMessages);
    }
  }, [initialMessages, setMessages, isInitial]);

  // Auto-trigger first message for newly created conversations
  useEffect(() => {
    if (!isInitial || initialSent.current) return;
    if (initialMessages.length === 1 && initialMessages[0].role === "user") {
      initialSent.current = true;
      setError(null);
      sendMessage({ text: initialMessages[0].content });
    }
  }, [isInitial, initialMessages, sendMessage]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    const messageText = input.trim();
    setInput("");
    setError(null);

    // Save user message to DB
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id: conversation.id,
        role: "user",
        content: messageText,
      }),
    });

    // Auto-update title if early in conversation
    if (messages.length <= 1 && conversation.title === "New Chat") {
      fetch(`/api/conversations/${conversation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: messageText.substring(0, 100) }),
      });
    }

    sendMessage({ text: messageText });
  }, [input, isStreaming, conversation, messages.length, sendMessage]);

  const displayMessages = messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant" | "system",
    content: getTextContent(m.parts as Array<{ type: string; text?: string }>),
  }));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: "var(--border)" }}
      >
        <h2 className="font-medium truncate" style={{ color: "var(--foreground)" }}>
          {conversation.title}
        </h2>
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {conversation.provider} / {conversation.model}
        </span>
      </div>

      <ChatMessages messages={displayMessages} isLoading={isStreaming} />

      {error && (
        <div className="px-4 py-2 text-sm text-red-400 border-t" style={{ borderColor: "var(--border)", background: "var(--sidebar-bg)" }}>
          Error: {error}
        </div>
      )}

      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSendMessage}
        disabled={isStreaming}
      />
    </div>
  );
}
