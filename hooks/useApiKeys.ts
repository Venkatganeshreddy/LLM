"use client";

import useSWR from "swr";
import { ApiKeyDisplay, Provider } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useApiKeys() {
  const { data, error, isLoading, mutate } = useSWR<ApiKeyDisplay[]>(
    "/api/api-keys",
    fetcher
  );

  async function saveKey(provider: Provider, apiKey: string) {
    const res = await fetch("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, api_key: apiKey }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to save API key");
    }
    mutate();
    return res.json();
  }

  async function deleteKey(id: string) {
    const res = await fetch(`/api/api-keys?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete API key");
    }
    mutate();
  }

  function hasKey(provider: Provider): boolean {
    return data?.some((k) => k.provider === provider) ?? false;
  }

  return { keys: data || [], error, isLoading, saveKey, deleteKey, hasKey };
}
