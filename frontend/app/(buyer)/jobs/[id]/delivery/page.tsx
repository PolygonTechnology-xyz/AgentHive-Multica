"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";
import { apiFetch, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./delivery.module.css";

type Attachment = { fileId: string; name: string; sizeBytes: number; contentType: string; downloadUrl: string; expiresAt: string };
type Delivery = {
  id: string;
  jobId: string;
  dispatchId: string;
  revisionRound: number;
  status: "submitted" | "approved" | "revision_requested";
  message: string | null;
  attachments: Attachment[];
  submittedBy: string;
  createdAt: string;
};

function sortDeliveries(deliveries: Delivery[]) {
  return [...deliveries].sort((a, b) => {
    if (b.revisionRound !== a.revisionRound) return b.revisionRound - a.revisionRound;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function formatBytes(sizeBytes: number) {
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) return "";
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)} KB`;
  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DeliveryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useFetch<{ data: Delivery[] }>(`/jobs/${id}/deliveries`);
  const [revisionNote, setRevisionNote] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const deliveries = sortDeliveries(data?.data ?? []);
  const latest = deliveries[0];

  async function approve(deliveryId: string) {
    setLoading("approve");
    setError("");
    try {
      await apiFetch(`/deliveries/${deliveryId}/approve`, { method: "POST" });
      router.push(`/jobs/${id}/complete`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to approve");
    } finally {
      setLoading(null);
      setConfirmOpen(false);
    }
  }

  async function requestRevision(deliveryId: string) {
    if (revisionNote.trim().length < 10) {
      setError("Revision notes must be at least 10 characters.");
      return;
    }
    setLoading("revision");
    setError("");
    try {
      await apiFetch(`/deliveries/${deliveryId}/request-revision`, {
        method: "POST",
        body: JSON.stringify({ reason: revisionNote }),
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
            <span className={styles.round}>Round {latest.revisionRound}</span>
            <span className={styles.status}>{latest.status.replace("_", " ")}</span>
            <span className={styles.dim}>{new Date(latest.createdAt).toLocaleDateString()}</span>
          </div>
          {latest.message && <p className={styles.note}>{latest.message}</p>}
          {latest.attachments?.length > 0 && (
            <div className={styles.attachments}>
              <div className={styles.attachLabel}>Attachments</div>
              {latest.attachments.map((att) => (
                <a key={att.fileId} href={att.downloadUrl} target="_blank" rel="noreferrer" className={styles.attachment}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  <span>{att.name}</span>
                  <span className={styles.attachmentMeta}>{formatBytes(att.sizeBytes)}</span>
                </a>
              ))}
            </div>
          )}
          {latest.status === "submitted" && (
            <>
              <div className={styles.actions}>
                <Button onClick={() => setConfirmOpen(true)} disabled={!!loading}>
                  Approve & release payment
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
                  {loading === "revision" ? "Requesting..." : "Request revision"}
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {deliveries.length > 1 && (
        <section className={styles.history} aria-label="Delivery history">
          <h2 className={styles.historyTitle}>Delivery history</h2>
          {deliveries.slice(1).map((delivery) => (
            <Card key={delivery.id} className={styles.historyCard}>
              <div className={styles.deliveryMeta}>
                <span className={styles.round}>Round {delivery.revisionRound}</span>
                <span className={styles.status}>{delivery.status.replace("_", " ")}</span>
                <span className={styles.dim}>{new Date(delivery.createdAt).toLocaleDateString()}</span>
              </div>
              {delivery.message && <p className={styles.note}>{delivery.message}</p>}
              {delivery.attachments.length > 0 && (
                <div className={styles.historyAttachments}>
                  {delivery.attachments.map((att) => (
                    <a key={att.fileId} href={att.downloadUrl} target="_blank" rel="noreferrer" className={styles.attachment}>
                      {att.name}
                    </a>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </section>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Approve and release payment?"
        description="This will release the escrowed payment to the freelancer and mark the job complete. This cannot be undone."
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        isLoading={loading === "approve"}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => latest && approve(latest.id)}
      />
    </div>
  );
}
