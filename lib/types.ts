export type Provider = "openai" | "anthropic" | "openrouter";

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  model: string;
  provider: Provider;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  provider: Provider;
  encrypted_key: string;
  created_at: string;
}

export interface ApiKeyDisplay {
  id: string;
  provider: Provider;
  masked_key: string;
  created_at: string;
}

export interface ModelOption {
  id: string;
  name: string;
}

export interface ProviderModels {
  provider: Provider;
  label: string;
  models: ModelOption[];
  supportsCustomModel?: boolean;
}
