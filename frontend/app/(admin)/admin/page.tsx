"use client";

import { useFetch } from "@/hooks/useFetch";
import { Card } from "@/components/ui/Card/Card";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./admin.module.css";

type Stats = { data: { userCount: number; jobCount: number; totalRevenue: number; activeDisputes: number } };

export default function AdminDashboardPage() {
  const { data, isLoading } = useFetch<Stats>("/admin/stats");
  const s = data?.data ?? { userCount: 0, jobCount: 0, totalRevenue: 0, activeDisputes: 0 };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Platform Overview</h1>
      {isLoading ? (
        <div className={styles.loading}><Spinner /></div>
      ) : (
        <div className={styles.stats}>
          {[
            { label: "Total users", value: s.userCount, color: "var(--accent)" },
            { label: "Total jobs", value: s.jobCount, color: "var(--cyan)" },
            { label: "Platform revenue", value: `৳${Number(s.totalRevenue).toLocaleString()}`, color: "var(--violet)" },
            { label: "Active disputes", value: s.activeDisputes, color: s.activeDisputes > 0 ? "var(--error)" : "var(--text-faint)" },
          ].map((stat) => (
            <Card key={stat.label} className={styles.stat}>
              <div className={styles.statVal} style={{ color: stat.color }}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </Card>
          ))}
        </div>
      )}
      <div className={styles.quickLinks}>
        <a href="/admin/accounts" className={styles.quickLink}>Manage Users →</a>
        <a href="/admin/disputes" className={styles.quickLink}>Open Disputes →</a>
      </div>
    </div>
  );
}
