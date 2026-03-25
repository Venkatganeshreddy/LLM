"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const admin = createAdminClient();
  const email = formData.get("email") as string;
  const password = process.env.DEFAULT_PASSWORD || "password123";

  // Try sign in first
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!signInError) {
    redirect("/");
  }

  // If sign in fails (user doesn't exist or email not confirmed),
  // use admin API to create/confirm the user
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find((u) => u.email === email);

  if (existingUser) {
    // User exists but not confirmed — confirm them via admin API
    await admin.auth.admin.updateUserById(existingUser.id, {
      email_confirm: true,
    });
  } else {
    // Create new user with auto-confirm via admin API
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      return { error: createError.message };
    }
  }

  // Now sign in — should work since user is confirmed
  const { error: finalSignInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (finalSignInError) {
    return { error: finalSignInError.message };
  }

  redirect("/settings");
}
