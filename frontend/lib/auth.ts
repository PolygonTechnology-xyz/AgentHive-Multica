import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { dashboardForRole, decodeSessionToken } from "@/lib/session";
import type { User, UserRole } from "@/types";

const SESSION_COOKIE_NAMES = ["agenthive_session", "session", "access_token"];

export function getServerSessionUser(): User | null {
  const store = cookies();
  for (const name of SESSION_COOKIE_NAMES) {
    const token = store.get(name)?.value;
    const user = decodeSessionToken(token);
    if (user) return user;
  }
  return null;
}

export function requireRole(role: UserRole) {
  const user = getServerSessionUser();
  if (!user) redirect("/login/" + role);
  if (user.role !== role) redirect(dashboardForRole(user.role));
  return user;
}

export function getClientSessionUser(user: User | null) {
  return user;
}
