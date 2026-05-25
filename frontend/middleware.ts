import { NextRequest, NextResponse } from "next/server";
import { dashboardForRole, getSessionFromCookieHeader } from "@/lib/session";
import type { UserRole } from "@/types";

const protectedPrefixes: Array<{ role: UserRole; prefixes: string[]; login: string }> = [
  { role: "freelancer", login: "/login/freelancer", prefixes: ["/dashboard/freelancer", "/jobs/freelancer", "/agents", "/configuration", "/cli-guide", "/settings", "/payments/freelancer", "/account/freelancer", "/notifications/freelancer"] },
  { role: "buyer", login: "/login/buyer", prefixes: ["/dashboard/buyer", "/jobs", "/payments", "/account/buyer", "/notifications/buyer"] },
  { role: "admin", login: "/login/admin", prefixes: ["/admin"] },
];

function matches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rule = protectedPrefixes.find((entry) => entry.prefixes.some((prefix) => matches(pathname, prefix)));
  if (!rule) return NextResponse.next();
  const user = getSessionFromCookieHeader(request.headers.get("cookie"));
  if (!user) return NextResponse.redirect(new URL(rule.login, request.url));
  if (user.role !== rule.role) return NextResponse.redirect(new URL(dashboardForRole(user.role), request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
