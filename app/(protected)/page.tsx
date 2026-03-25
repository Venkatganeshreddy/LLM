"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { ChatInput } from "@/components/chat/ChatInput";
import { useConversations } from "@/hooks/useConversations";
import { useApiKeys } from "@/hooks/useApiKeys";
import { Provider } from "@/lib/types";
import { PROVIDER_MODELS } from "@/lib/llm/models";

const API_KEY_INSTRUCTIONS: Record<string, { url: string; steps: string[] }> = {
  openai: {
    url: "https://platform.openai.com/api-keys",
    steps: [
      "Go to platform.openai.com and sign in",
      "Navigate to API Keys in your account settings",
      "Click \"Create new secret key\"",
      "Copy the key (starts with sk-...)",
    ],
  },
  anthropic: {
    url: "https://console.anthropic.com/settings/keys",
    steps: [
      "Go to console.anthropic.com and sign in",
      "Navigate to Settings > API Keys",
      "Click \"Create Key\"",
      "Copy the key (starts with sk-ant-...)",
    ],
  },
  openrouter: {
    url: "https://openrouter.ai/keys",
    steps: [
      "Go to openrouter.ai and sign in",
      "Navigate to Keys in your account",
      "Click \"Create Key\"",
      "Copy the key (starts with sk-or-...)",
    ],
  },
};

function FirstTimeSetup() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div
        className="max-w-lg w-full rounded-2xl border p-8 space-y-6"
        style={{
          borderColor: "var(--border)",
          background: "var(--sidebar-bg)",
        }}
      >
        <div className="text-center space-y-2">
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            Welcome to LLM Chat
          </h1>
          <p style={{ color: "var(--muted)" }}>
            To get started, you need to add at least one API key. Your keys are
            encrypted and stored securely — only you can access your
            conversations and data.
          </p>
        </div>

        <div className="space-y-4">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            How to get an API key:
          </h2>

          {PROVIDER_MODELS.map((p) => {
            const info = API_KEY_INSTRUCTIONS[p.provider];
            if (!info) return null;
            return (
              <div
                key={p.provider}
                className="rounded-lg border p-4 space-y-2"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--background)",
                }}
              >
                <div className="flex items-center justify-between">
                  <h3
                    className="font-medium"
                    style={{ color: "var(--foreground)" }}
                  >
                    {p.label}
                  </h3>
                  <a
                    href={info.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2 py-1 rounded transition-colors"
                    style={{ color: "var(--accent)" }}
                  >
                    Get Key &rarr;
                  </a>
                </div>
                <ol className="text-sm space-y-1 list-decimal list-inside" style={{ color: "var(--muted)" }}>
                  {info.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>

        <Link
          href="/settings"
          className="block w-full text-center py-3 rounded-lg font-medium text-white transition-colors"
          style={{ background: "var(--accent)" }}
        >
          Go to Settings to Add Your API Key
        </Link>
      </div>
    </div>
  );
}

export default function NewChatPage() {
  const router = useRouter();
  const { createConversation } = useConversations();
  const { keys, isLoading, hasKey } = useApiKeys();
  const [provider, setProvider] = useState<Provider>("openai");
  const [model, setModel] = useState(PROVIDER_MODELS[0].models[0]?.id || "");
  const [input, setInput] = useState("");
  const [creating, setCreating] = useState(false);

  // Show onboarding if user has no API keys
  if (!isLoading && keys.length === 0) {
    return <FirstTimeSetup />;
  }

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
