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
    models: [
      { id: "openai/gpt-4o", name: "GPT-4o" },
      { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
      { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4" },
      { id: "anthropic/claude-haiku-4", name: "Claude Haiku 4" },
      { id: "google/gemini-2.5-pro-preview", name: "Gemini 2.5 Pro" },
      { id: "google/gemini-2.5-flash-preview", name: "Gemini 2.5 Flash" },
      { id: "meta-llama/llama-4-maverick", name: "Llama 4 Maverick" },
      { id: "meta-llama/llama-4-scout", name: "Llama 4 Scout" },
      { id: "deepseek/deepseek-r1", name: "DeepSeek R1" },
      { id: "deepseek/deepseek-chat-v3", name: "DeepSeek V3" },
      { id: "mistralai/mistral-large", name: "Mistral Large" },
      { id: "qwen/qwen3-235b", name: "Qwen3 235B" },
    ],
    supportsCustomModel: true,
  },
];

export function getProviderLabel(provider: string): string {
  return (
    PROVIDER_MODELS.find((p) => p.provider === provider)?.label || provider
  );
}
