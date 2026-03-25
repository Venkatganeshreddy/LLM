"use client";

import Link from "next/link";
import { useApiKeys } from "@/hooks/useApiKeys";
import { ApiKeyForm } from "@/components/settings/ApiKeyForm";
import { ApiKeyCard } from "@/components/settings/ApiKeyCard";

export default function SettingsPage() {
  const { keys, isLoading, saveKey, deleteKey } = useApiKeys();

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
      <h1
        className="text-2xl font-bold mb-2"
        style={{ color: "var(--foreground)" }}
      >
        Settings
      </h1>
      <p className="mb-8" style={{ color: "var(--muted)" }}>
        Add your API keys to start chatting with LLMs. Keys are encrypted and
        stored securely. Each user&apos;s keys and conversations are private.
      </p>

      <div className="mb-8">
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--foreground)" }}
        >
          Add API Key
        </h2>
        <ApiKeyForm onSave={saveKey} />
      </div>

      <div>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--foreground)" }}
        >
          Saved Keys
        </h2>
        {isLoading ? (
          <p style={{ color: "var(--muted)" }}>Loading...</p>
        ) : keys.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>
            No API keys saved yet. Add one above to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <ApiKeyCard key={key.id} apiKey={key} onDelete={deleteKey} />
            ))}
          </div>
        )}
      </div>

      {keys.length > 0 && (
        <div className="mt-8">
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-lg font-medium text-white transition-colors"
            style={{ background: "var(--accent)" }}
          >
            Start Chatting &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
