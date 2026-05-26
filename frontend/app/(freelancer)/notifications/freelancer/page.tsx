"use client";

import { useFetch } from "@/hooks/useFetch";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./notif.module.css";

type Notif = { id: string; type: string; title: string; body: string; readAt: string | null; createdAt: string };
type Resp = { data: { items: Notif[]; unreadCount: number; total: number } };

export default function FreelancerNotificationsPage() {
  const { data, isLoading, mutate } = useFetch<Resp>("/notifications?limit=50");
  const notifs = data?.data?.items ?? [];
  const unread = data?.data?.unreadCount ?? 0;

  async function markAll() {
    await apiFetch("/notifications/read-all", { method: "PATCH" });
    await mutate();
  }

  async function markOne(id: string) {
    await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
    await mutate();
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Notifications</h1>
          {unread > 0 && <span className={styles.unreadBadge}>{unread} unread</span>}
        </div>
        {unread > 0 && <Button variant="ghost" onClick={markAll}>Mark all read</Button>}
      </div>
      {isLoading ? (
        <div className={styles.loading}><Spinner /></div>
      ) : notifs.length === 0 ? (
        <Card className={styles.empty}>No notifications yet.</Card>
      ) : (
        <div className={styles.list}>
          {notifs.map((n) => (
            <div key={n.id} className={styles.item + (!n.readAt ? " " + styles.unread : "")} onClick={() => !n.readAt && markOne(n.id)}>
              {!n.readAt && <div className={styles.dot} />}
              <div className={styles.content}>
                <div className={styles.notifTitle}>{n.title}</div>
                <div className={styles.notifBody}>{n.body}</div>
                <div className={styles.notifTime}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
