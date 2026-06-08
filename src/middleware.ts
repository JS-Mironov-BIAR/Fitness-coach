import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, adminSessionToken } from "@/lib/adminAuth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Логин-эндпоинты доступны без авторизации
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  let valid = false;
  try {
    valid = !!cookie && cookie === (await adminSessionToken());
  } catch {
    valid = false;
  }

  if (valid) return NextResponse.next();

  // API → 401, страницы → редирект на логин
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
