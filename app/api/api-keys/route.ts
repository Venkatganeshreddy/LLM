import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/encryption";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, provider, encrypted_key, created_at")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return masked keys
  const masked = data.map((key) => ({
    id: key.id,
    provider: key.provider,
    masked_key: "••••" + key.encrypted_key.slice(-8),
    created_at: key.created_at,
  }));

  return NextResponse.json(masked);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { provider, api_key } = await request.json();

  if (!provider || !api_key) {
    return NextResponse.json(
      { error: "Provider and api_key are required" },
      { status: 400 }
    );
  }

  const encrypted_key = encrypt(api_key);

  const { data, error } = await supabase
    .from("api_keys")
    .upsert(
      {
        user_id: user.id,
        provider,
        encrypted_key,
      },
      { onConflict: "user_id,provider" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    provider: data.provider,
    masked_key: "••••" + encrypted_key.slice(-8),
    created_at: data.created_at,
  });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
