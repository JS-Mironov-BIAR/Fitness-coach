// Простая авторизация админки по одному общему паролю.
// В cookie кладём не пароль, а его SHA-256 хэш (с солью). Middleware
// и логин-роут считают один и тот же токен из ADMIN_PASSWORD.

export const ADMIN_COOKIE = "fc_admin";

export async function adminSessionToken(): Promise<string> {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) throw new Error("ADMIN_PASSWORD не задан");
  const data = new TextEncoder().encode(`fitness-coach::${pwd}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
