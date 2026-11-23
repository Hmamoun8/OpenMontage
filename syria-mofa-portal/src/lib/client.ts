"use client";
export function csrf() {
  return document.cookie.split("; ").find((c) => c.startsWith("mofa_csrf="))?.split("=")[1] ?? "";
}
export async function api<T = unknown>(url: string, init: RequestInit & { json?: unknown } = {}): Promise<{ ok: boolean; status: number; data: T & { error?: string } }> {
  const headers: Record<string, string> = { "x-csrf-token": csrf(), ...(init.headers as Record<string, string>) };
  let body = init.body;
  if (init.json !== undefined) { headers["content-type"] = "application/json"; body = JSON.stringify(init.json); }
  const res = await fetch(url, { ...init, headers, body, credentials: "same-origin" });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
