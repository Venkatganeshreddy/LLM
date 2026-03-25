import { NextRequest } from "next/server";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/encryption";
import { createLLMProvider } from "@/lib/llm/providers";
import { Provider } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { messages, provider, model } = body as {
    messages: UIMessage[];
    provider: string;
    model: string;
  };

  if (!provider || !model || !messages) {
    return new Response("Missing provider, model, or messages", {
      status: 400,
    });
  }

  // Fetch the user's API key for this provider
  const { data: keyData, error: keyError } = await supabase
    .from("api_keys")
    .select("encrypted_key")
    .eq("user_id", user.id)
    .eq("provider", provider as Provider)
    .single();

  if (keyError || !keyData) {
    return new Response(
      `No API key found for ${provider}. Please add one in Settings.`,
      { status: 400 }
    );
  }

  const apiKey = decrypt(keyData.encrypted_key);
  const llmProvider = createLLMProvider(provider as Provider, apiKey);

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: llmProvider(model),
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
