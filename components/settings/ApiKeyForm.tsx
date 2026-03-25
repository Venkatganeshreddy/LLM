"use client";

import { useState } from "react";
import { Provider } from "@/lib/types";
import { PROVIDER_MODELS } from "@/lib/llm/models";

interface ApiKeyFormProps {
  onSave: (provider: Provider, apiKey: string) => Promise<void>;
}

export function ApiKeyForm({ onSave }: ApiKeyFormProps) {
  const [provider, setProvider] = useState<Provider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await onSave(provider, apiKey.trim());
      setApiKey("");
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
          placeholder="sk-..."
          className="w-full px-3 py-2 rounded-lg border outline-none"
          style={{
            background: "var(--input-bg)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

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
