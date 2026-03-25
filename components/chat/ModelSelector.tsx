"use client";

import { useState } from "react";
import { Provider } from "@/lib/types";
import { PROVIDER_MODELS } from "@/lib/llm/models";

interface ModelSelectorProps {
  provider: Provider;
  model: string;
  onProviderChange: (provider: Provider) => void;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}

export function ModelSelector({
  provider,
  model,
  onProviderChange,
  onModelChange,
  disabled,
}: ModelSelectorProps) {
  const [customModel, setCustomModel] = useState("");
  const currentProvider = PROVIDER_MODELS.find((p) => p.provider === provider);

  return (
    <div className="flex items-center gap-3">
      <select
        value={provider}
        onChange={(e) => {
          const newProvider = e.target.value as Provider;
          onProviderChange(newProvider);
          const providerConfig = PROVIDER_MODELS.find(
            (p) => p.provider === newProvider
          );
          if (providerConfig?.models.length) {
            onModelChange(providerConfig.models[0].id);
          }
        }}
        disabled={disabled}
        className="px-3 py-2 rounded-lg border text-sm outline-none disabled:opacity-50"
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

      {currentProvider?.supportsCustomModel ? (
        <input
          type="text"
          value={customModel || model}
          onChange={(e) => {
            setCustomModel(e.target.value);
            onModelChange(e.target.value);
          }}
          placeholder="e.g. google/gemini-pro"
          disabled={disabled}
          className="px-3 py-2 rounded-lg border text-sm outline-none flex-1 min-w-[200px] disabled:opacity-50"
          style={{
            background: "var(--input-bg)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        />
      ) : (
        <select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={disabled}
          className="px-3 py-2 rounded-lg border text-sm outline-none disabled:opacity-50"
          style={{
            background: "var(--input-bg)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          {currentProvider?.models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
