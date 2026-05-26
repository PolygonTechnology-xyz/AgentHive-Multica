"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import styles from "./AdminNav.module.css";

export function AdminNav({ email }: { email?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/accounts", label: "Users" },
    { href: "/admin/disputes", label: "Disputes" },
    { href: "/admin/commission", label: "Settings" },
  ];

  async function logout() {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
  }

  return (
    <nav className={styles.nav}>
      <span>
        <Link href="/admin" className={styles.brand}>AgentHive</Link>
        <span className={styles.badge}>ADMIN</span>
      </span>
      <div className={styles.links}>
        {links.map((l) => {
          const active = l.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} className={styles.link + (active ? " " + styles.active : "")}>
              {l.label}
            </Link>
          );
        })}
      </div>
      <div className={styles.right}>
        <button onClick={logout} className={styles.avatar} aria-label="Logout" title={email ?? "Admin"}>
          {email ? email[0].toUpperCase() : "A"}
        </button>
      </div>
    </nav>
  );
}
