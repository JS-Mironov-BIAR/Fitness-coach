import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, adminSessionToken } from "@/lib/adminAuth";

// Известные инструменты взлома/сканеры — блокируем на любых API
const BAD_BOT =
  /sqlmap|nikto|nmap|masscan|nuclei|wpscan|acunetix|zgrab|fimap|dirbuster|gobuster|hydra|metasploit|libwww-perl|python-requests|go-http-client|scrapy|httraq|netsparker/i;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ua = req.headers.get("user-agent") || "";

  // 1) Блокировка атак-инструментов на API
  if (pathname.startsWith("/api/") && BAD_BOT.test(ua)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // 2) Авторизация админки
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (!isAdmin) return NextResponse.next();

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

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
