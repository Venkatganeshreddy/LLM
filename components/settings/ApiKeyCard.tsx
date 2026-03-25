"use client";

import { ApiKeyDisplay } from "@/lib/types";
import { getProviderLabel } from "@/lib/llm/models";

interface ApiKeyCardProps {
  apiKey: ApiKeyDisplay;
  onDelete: (id: string) => void;
}

export function ApiKeyCard({ apiKey, onDelete }: ApiKeyCardProps) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-lg border"
      style={{ borderColor: "var(--border)", background: "var(--input-bg)" }}
    >
      <div>
        <p className="font-medium" style={{ color: "var(--foreground)" }}>
          {getProviderLabel(apiKey.provider)}
        </p>
        <p className="text-sm font-mono" style={{ color: "var(--muted)" }}>
          {apiKey.masked_key}
        </p>
      </div>
      <button
        onClick={() => onDelete(apiKey.id)}
        className="px-3 py-1 text-sm rounded-lg border transition-colors hover:bg-red-500 hover:text-white hover:border-red-500"
        style={{ borderColor: "var(--border)", color: "var(--muted)" }}
      >
        Delete
      </button>
    </div>
  );
}
