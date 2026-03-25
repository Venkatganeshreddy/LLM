"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  const [loadingConv, setLoadingConv] = useState(true);
  const [input, setInput] = useState("");
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
        provider: conversation?.provider,
        model: conversation?.model,
      },
    }),
    onFinish: async ({ message }) => {
      // Save assistant message to DB
      const content = getTextContent(message.parts);
      if (content) {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: conversationId,
            role: "assistant",
            content,
          }),
        });
      }
    },
  });

  const isStreaming = status === "streaming" || status === "submitted";

  // Load conversation and messages
  useEffect(() => {
    async function load() {
      setLoadingConv(true);
      try {
        const [convRes, msgsRes] = await Promise.all([
          fetch(`/api/conversations/${conversationId}`),
          fetch(`/api/messages?conversationId=${conversationId}`),
        ]);

        if (convRes.ok) {
          const conv = await convRes.json();
          setConversation(conv);
        }

        if (msgsRes.ok) {
          const dbMessages: DBMessage[] = await msgsRes.json();
          const chatMessages = dbMessages.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant" | "system",
            parts: [{ type: "text" as const, text: m.content }],
          }));
          setMessages(chatMessages);
        }
      } catch (err) {
        console.error("Failed to load conversation:", err);
      } finally {
        setLoadingConv(false);
      }
    }

    load();
  }, [conversationId, setMessages]);

  // Auto-send the first message if this is a newly created conversation
  const triggerInitialMessage = useCallback(async () => {
    if (!conversation || !isInitial || initialSent.current) return;
    initialSent.current = true;

    const msgsRes = await fetch(
      `/api/messages?conversationId=${conversationId}`
    );
    if (!msgsRes.ok) return;

    const dbMessages: DBMessage[] = await msgsRes.json();
    if (dbMessages.length === 1 && dbMessages[0].role === "user") {
      setMessages([
        {
          id: dbMessages[0].id,
          role: "user",
          parts: [{ type: "text" as const, text: dbMessages[0].content }],
        },
      ]);

      // Trigger the stream by sending the same text
      sendMessage({ text: dbMessages[0].content });
    }
  }, [conversation, isInitial, conversationId, setMessages, sendMessage]);

  useEffect(() => {
    if (conversation && isInitial && !loadingConv) {
      triggerInitialMessage();
    }
  }, [conversation, isInitial, loadingConv, triggerInitialMessage]);

  async function handleSendMessage() {
    if (!input.trim() || isStreaming || !conversation) return;

    const messageText = input.trim();
    setInput("");

    // Save user message to DB first
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id: conversationId,
        role: "user",
        content: messageText,
      }),
    });

    // Auto-update title if it's a generic title and this is early in the conversation
    if (messages.length <= 1 && conversation.title === "New Chat") {
      const title = messageText.substring(0, 100);
      fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
    }

    // Send message via useChat (this triggers the stream)
    sendMessage({ text: messageText });
  }

  if (loadingConv) {
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

  // Convert UIMessage format to our display format
  const displayMessages = messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant" | "system",
    content: getTextContent(m.parts as Array<{ type: string; text?: string }>),
  }));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: "var(--border)" }}
      >
        <h2
          className="font-medium truncate"
          style={{ color: "var(--foreground)" }}
        >
          {conversation.title}
        </h2>
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {conversation.provider} / {conversation.model}
        </span>
      </div>

      <ChatMessages messages={displayMessages} isLoading={isStreaming} />

      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSendMessage}
        disabled={isStreaming}
      />
    </div>
  );
}
