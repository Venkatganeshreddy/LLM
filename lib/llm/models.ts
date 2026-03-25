import { ProviderModels } from "@/lib/types";

export const PROVIDER_MODELS: ProviderModels[] = [
  {
    provider: "openai",
    label: "OpenAI",
    models: [
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
      { id: "o1", name: "o1" },
      { id: "o1-mini", name: "o1 Mini" },
    ],
  },
  {
    provider: "anthropic",
    label: "Anthropic",
    models: [
      { id: "claude-opus-4-6", name: "Claude Opus 4.6" },
      { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6" },
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5" },
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
    ],
  },
  {
    provider: "openrouter",
    label: "OpenRouter",
    models: [],
    supportsCustomModel: true,
  },
];

export function getProviderLabel(provider: string): string {
  return (
    PROVIDER_MODELS.find((p) => p.provider === provider)?.label || provider
  );
}
