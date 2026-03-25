"use client";

import useSWR from "swr";
import { Conversation, Provider } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useConversations() {
  const { data, error, isLoading, mutate } = useSWR<Conversation[]>(
    "/api/conversations",
    fetcher
  );

  async function createConversation(
    model: string,
    provider: Provider,
    title?: string
  ): Promise<Conversation> {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title || "New Chat", model, provider }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create conversation");
    }
    const conversation = await res.json();
    mutate();
    return conversation;
  }

  async function updateConversation(
    id: string,
    updates: Partial<Conversation>
  ) {
    const res = await fetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update conversation");
    }
    mutate();
  }

  async function deleteConversation(id: string) {
    const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete conversation");
    }
    mutate();
  }

  return {
    conversations: data || [],
    error,
    isLoading,
    createConversation,
    updateConversation,
    deleteConversation,
    mutate,
  };
}
