import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { Provider } from "@/lib/types";

export function createLLMProvider(provider: Provider, apiKey: string) {
  switch (provider) {
    case "openai":
      return createOpenAI({ apiKey });
    case "anthropic":
      return createAnthropic({ apiKey });
    case "openrouter":
      return createOpenRouter({ apiKey });
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
