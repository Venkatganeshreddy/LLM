"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();
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

  // If sign in fails, try sign up
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  // Sign in after sign up
  const { error: postSignInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (postSignInError) {
    return { error: postSignInError.message };
  }

  redirect("/settings");
}
