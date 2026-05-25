import type { User, UserRole } from "@/types";

const SESSION_COOKIE_NAMES = ["agenthive_session", "session", "access_token"];
type JwtPayload = { sub?: string; id?: string; email?: string; role?: UserRole; name?: string; verified?: boolean };

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  if (typeof atob === "function") return atob(padded);
  return Buffer.from(padded, "base64").toString("utf8");
}

export function readSessionCookie(cookieHeader: string | null | undefined) {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map((part) => part.trim());
  for (const name of SESSION_COOKIE_NAMES) {
    const pair = cookies.find((cookie) => cookie.startsWith(name + "="));
    if (pair) return decodeURIComponent(pair.slice(name.length + 1));
  }
  return null;
}

export function decodeSessionToken(token: string | null | undefined): User | null {
  if (!token) return null;
  const [, payload] = token.split(".");
  if (!payload) return null;
  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as JwtPayload;
    if (!parsed.role || !parsed.email) return null;
    return { id: parsed.sub ?? parsed.id ?? "", email: parsed.email, name: parsed.name, role: parsed.role, verified: parsed.verified ?? false };
  } catch {
    return null;
  }
}

export function getSessionFromCookieHeader(cookieHeader: string | null | undefined) {
  return decodeSessionToken(readSessionCookie(cookieHeader));
}

export function dashboardForRole(role: UserRole) {
  if (role === "buyer") return "/dashboard/buyer";
  if (role === "freelancer") return "/dashboard/freelancer";
  return "/admin";
}
