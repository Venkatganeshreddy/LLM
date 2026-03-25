"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { ChatInput } from "@/components/chat/ChatInput";
import { useConversations } from "@/hooks/useConversations";
import { useApiKeys } from "@/hooks/useApiKeys";
import { Provider } from "@/lib/types";
import { PROVIDER_MODELS } from "@/lib/llm/models";

export default function NewChatPage() {
  const router = useRouter();
  const { createConversation } = useConversations();
  const { hasKey } = useApiKeys();
  const [provider, setProvider] = useState<Provider>("openai");
  const [model, setModel] = useState(PROVIDER_MODELS[0].models[0]?.id || "");
  const [input, setInput] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleSubmit() {
    if (!input.trim() || creating) return;

    if (!hasKey(provider)) {
      alert(
        `No API key found for ${provider}. Please add one in Settings first.`
      );
      router.push("/settings");
      return;
    }

    setCreating(true);
    try {
      const title = input.trim().substring(0, 100);
      const conversation = await createConversation(model, provider, title);

      // Save user message
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversation.id,
          role: "user",
          content: input.trim(),
        }),
      });

      // Navigate to the conversation page where streaming will begin
      router.push(`/chat/${conversation.id}?initial=true`);
    } catch (err) {
      console.error("Failed to create conversation:", err);
      setCreating(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            LLM Chat
          </h1>
          <p style={{ color: "var(--muted)" }}>
            Choose a model and start chatting
          </p>
          <ModelSelector
            provider={provider}
            model={model}
            onProviderChange={setProvider}
            onModelChange={setModel}
          />
        </div>
      </div>

      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        disabled={creating}
        placeholder={
          creating ? "Creating conversation..." : "Type a message..."
        }
      />
    </div>
  );
}
