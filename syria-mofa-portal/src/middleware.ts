import { NextResponse, type NextRequest } from "next/server";
import { ACTIVE_LOCALES, DEFAULT_LOCALE, isLocale } from "./lib/i18n";
import { CSRF_COOKIE, SESSION_COOKIE, verifySession } from "./lib/server/security";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const seg = pathname.split("/")[1];

  let res: NextResponse;
  if (pathname.startsWith("/api")) {
    res = NextResponse.next();
  } else if (!isLocale(seg)) {
    // Locale-less URL (e.g. /dashboard/mission) → preferred locale.
    const pref = req.cookies.get("locale")?.value;
    const accept = req.headers.get("accept-language") ?? "";
    const loc = isLocale(pref) ? pref : ACTIVE_LOCALES.find((l) => accept.startsWith(l)) ?? DEFAULT_LOCALE;
    const url = req.nextUrl.clone();
    url.pathname = `/${loc}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  } else {
    // Role-based protection for staff dashboards.
    const rest = "/" + pathname.split("/").slice(2).join("/");
    if (rest.startsWith("/dashboard")) {
      const s = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
      const need = rest.startsWith("/dashboard/admin") ? ["admin"] : ["officer", "admin"];
      if (!s || !need.includes(s.role)) {
        const url = req.nextUrl.clone();
        url.pathname = `/${seg}/login`;
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }
    }
    res = NextResponse.next();
    res.cookies.set("locale", seg, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  }

  if (!req.cookies.get(CSRF_COOKIE)) {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => b.toString(16).padStart(2, "0")).join("");
    res.cookies.set(CSRF_COOKIE, token, { path: "/", sameSite: "strict", secure: process.env.NODE_ENV === "production" });
  }
  return res;
}

export const config = { matcher: ["/((?!_next|favicon|story|.*\\..*).*)"] };
