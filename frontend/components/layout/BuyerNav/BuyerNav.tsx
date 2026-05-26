"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import styles from "./BuyerNav.module.css";

type NotifCount = { unreadCount: number };

export function BuyerNav({ email }: { email?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useFetch<{ data: NotifCount }>("/notifications?limit=1");
  const unread = data?.data?.unreadCount ?? 0;

  const links = [
    { href: "/dashboard/buyer", label: "Dashboard" },
    { href: "/jobs", label: "My Jobs" },
    { href: "/jobs/create", label: "+ Post Job" },
    { href: "/payments", label: "Payments" },
  ];

  async function logout() {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login/buyer");
  }

  return (
    <nav className={styles.nav}>
      <Link href="/dashboard/buyer" className={styles.brand}>AgentHive</Link>
      <div className={styles.links}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={styles.link + (pathname?.startsWith(l.href) ? " " + styles.active : "")}>
            {l.label}
          </Link>
        ))}
      </div>
      <div className={styles.right}>
        <Link href="/notifications/buyer" className={styles.bell} aria-label="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          {unread > 0 && <span className={styles.badge}>{unread > 9 ? "9+" : unread}</span>}
        </Link>
        <button
          onClick={logout}
          className={styles.avatar}
          aria-label="Account"
          title={email ?? "Account"}
        >
          {email ? email[0].toUpperCase() : "B"}
        </button>
      </div>
    </nav>
  );
}
