import type { SupabaseClient } from "@supabase/supabase-js";

export function getClientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim() || null;
  const real = req.headers.get("x-real-ip");
  return real ? real.trim() : null;
}

// Проверка Cloudflare Turnstile. Если секрет не задан — пропускаем (капча выключена).
export async function verifyTurnstile(token: string | null, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const form = new URLSearchParams();
    form.append("secret", secret);
    form.append("response", token);
    if (ip) form.append("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}

// Контакт или IP в чёрном списке?
export async function isBlocked(
  sb: SupabaseClient,
  contact: string | null,
  ip: string | null,
): Promise<boolean> {
  const values = [contact, ip].filter((v): v is string => !!v && v.trim() !== "");
  if (values.length === 0) return false;
  const { data } = await sb.from("blocklist").select("id").in("value", values).limit(1);
  return !!(data && data.length > 0);
}
