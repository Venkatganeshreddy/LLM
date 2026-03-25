"use client";

import { useState } from "react";
import { Provider } from "@/lib/types";
import { PROVIDER_MODELS } from "@/lib/llm/models";

const PROVIDER_HELP: Record<string, { url: string; placeholder: string; hint: string }> = {
  openai: {
    url: "https://platform.openai.com/api-keys",
    placeholder: "sk-...",
    hint: "Get your key from platform.openai.com > API Keys",
  },
  anthropic: {
    url: "https://console.anthropic.com/settings/keys",
    placeholder: "sk-ant-...",
    hint: "Get your key from console.anthropic.com > Settings > API Keys",
  },
  openrouter: {
    url: "https://openrouter.ai/keys",
    placeholder: "sk-or-...",
    hint: "Get your key from openrouter.ai > Keys (supports 100+ models)",
  },
};

interface ApiKeyFormProps {
  onSave: (provider: Provider, apiKey: string) => Promise<void>;
}

export function ApiKeyForm({ onSave }: ApiKeyFormProps) {
  const [provider, setProvider] = useState<Provider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const help = PROVIDER_HELP[provider];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await onSave(provider, apiKey.trim());
      setApiKey("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save key");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "var(--foreground)" }}
        >
          Provider
        </label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as Provider)}
          className="w-full px-3 py-2 rounded-lg border outline-none"
          style={{
            background: "var(--input-bg)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          {PROVIDER_MODELS.map((p) => (
            <option key={p.provider} value={p.provider}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "var(--foreground)" }}
        >
          API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={help?.placeholder || "sk-..."}
          className="w-full px-3 py-2 rounded-lg border outline-none"
          style={{
            background: "var(--input-bg)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        />
        {help && (
          <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
            {help.hint}{" "}
            <a
              href={help.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: "var(--accent)" }}
            >
              Open &rarr;
            </a>
          </p>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">API key saved successfully!</p>}

      <button
        type="submit"
        disabled={loading || !apiKey.trim()}
        className="px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
        style={{ background: "var(--accent)" }}
      >
        {loading ? "Saving..." : "Save API Key"}
      </button>
    </form>
  );
}
