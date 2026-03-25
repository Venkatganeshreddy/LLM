import { NextRequest } from "next/server";
import { streamText, UIMessage } from "ai";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/encryption";
import { createLLMProvider } from "@/lib/llm/providers";
import { Provider } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
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

    console.log("[chat] provider:", provider, "model:", model, "messages:", messages?.length);

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
      console.error("[chat] API key error:", keyError);
      return new Response(
        `No API key found for ${provider}. Please add one in Settings.`,
        { status: 400 }
      );
    }

    const apiKey = decrypt(keyData.encrypted_key);
    const llmProvider = createLLMProvider(provider as Provider, apiKey);

    // Map UIMessages to simple CoreMessage format to avoid schema validation issues
    const modelMessages = messages.map((m: UIMessage) => {
      const content = m.parts
        .filter((p) => p.type === "text")
        .map((p) => (p as { type: "text"; text: string }).text)
        .join("");
      return { role: m.role as "user" | "assistant" | "system", content };
    });

    console.log("[chat] Sending to LLM, model messages:", JSON.stringify(modelMessages).substring(0, 200));

    const result = streamText({
      model: llmProvider(model),
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    console.error("[chat] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(message, { status: 500 });
  }
}
