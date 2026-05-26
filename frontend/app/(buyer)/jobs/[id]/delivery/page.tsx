"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";
import { apiFetch, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./delivery.module.css";

type Delivery = { id: string; jobId: string; note: string; attachmentUrls: string[]; revisionRound: number; status: string; createdAt: string };

export default function DeliveryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useFetch<{ data: Delivery[] }>(`/deliveries?jobId=${id}`);
  const [revisionNote, setRevisionNote] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const deliveries = data?.data ?? [];
  const latest = deliveries[0];

  async function approve(deliveryId: string) {
    setLoading("approve");
    setError("");
    try {
      await apiFetch(`/deliveries/${deliveryId}/approve`, { method: "PATCH" });
      router.push(`/jobs/${id}/complete`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to approve");
    } finally {
      setLoading(null);
    }
  }

  async function requestRevision(deliveryId: string) {
    if (!revisionNote.trim()) { setError("Please enter revision notes"); return; }
    setLoading("revision");
    setError("");
    try {
      await apiFetch(`/deliveries/${deliveryId}/revision`, {
        method: "PATCH",
        body: JSON.stringify({ revisionNote }),
      });
      router.push(`/jobs/${id}/progress`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to request revision");
    } finally {
      setLoading(null);
    }
  }

  if (isLoading) return <div className={styles.loading}><Spinner /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}><a href={`/jobs/${id}/progress`}>← Job progress</a></div>
      <h1 className={styles.title}>Review delivery</h1>

      {error && <div className={styles.error}>{error}</div>}

      {!latest ? (
        <Card className={styles.empty}>No delivery submitted yet.</Card>
      ) : (
        <Card className={styles.card}>
          <div className={styles.deliveryMeta}>
            <span className={styles.round}>Round {latest.revisionRound + 1}</span>
            <span className={styles.dim}>{new Date(latest.createdAt).toLocaleDateString()}</span>
          </div>
          <p className={styles.note}>{latest.note}</p>
          {latest.attachmentUrls?.length > 0 && (
            <div className={styles.attachments}>
              <div className={styles.attachLabel}>Attachments</div>
              {latest.attachmentUrls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer" className={styles.attachment}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  {url.split("/").pop()}
                </a>
              ))}
            </div>
          )}
          {latest.status === "submitted" && (
            <>
              <div className={styles.actions}>
                <Button onClick={() => approve(latest.id)} disabled={!!loading}>
                  {loading === "approve" ? "Approving…" : "✓ Approve & release payment"}
                </Button>
              </div>
              <div className={styles.revisionSection}>
                <div className={styles.revisionLabel}>Request revision</div>
                <textarea
                  className={styles.textarea}
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  rows={3}
                  placeholder="Describe what needs to be changed…"
                />
                <Button variant="ghost" onClick={() => requestRevision(latest.id)} disabled={!!loading}>
                  {loading === "revision" ? "Requesting…" : "Request revision"}
                </Button>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
