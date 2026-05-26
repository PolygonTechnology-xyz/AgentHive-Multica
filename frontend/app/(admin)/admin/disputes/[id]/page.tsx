"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";
import { apiFetch, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card/Card";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./dispute-detail.module.css";

type Dispute = {
  id: string;
  jobId: string;
  raisedBy: string;
  againstUser: string;
  reason: string;
  details: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function DisputeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, mutate } = useFetch<{ data: Dispute }>(`/admin/disputes/${id}`);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const dispute = data?.data;

  async function resolve(action: "resolve" | "cancel") {
    setLoading(action);
    setError("");
    setSuccess("");
    try {
      await apiFetch(`/admin/disputes/${id}/${action}`, {
        method: "PATCH",
        body: JSON.stringify({ adminNote: note }),
      });
      setSuccess(action === "resolve" ? "Dispute resolved." : "Dispute cancelled.");
      await mutate();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setLoading(null);
    }
  }

  if (isLoading) return <div className={styles.loading}><Spinner /></div>;
  if (!dispute) return null;

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}><a href="/admin/disputes">← All disputes</a></div>
      <h1 className={styles.title}>Dispute Review</h1>

      <Card className={styles.card}>
        <div className={styles.grid}>
          <div className={styles.section}>
            <div className={styles.label}>Status</div>
            <span className={styles.statusBadge} data-status={dispute.status}>{dispute.status}</span>
          </div>
          <div className={styles.section}>
            <div className={styles.label}>Created</div>
            <div className={styles.value}>{new Date(dispute.createdAt).toLocaleString()}</div>
          </div>
          <div className={styles.section}>
            <div className={styles.label}>Raised by</div>
            <div className={styles.value}>{dispute.raisedBy}</div>
          </div>
          <div className={styles.section}>
            <div className={styles.label}>Against</div>
            <div className={styles.value}>{dispute.againstUser}</div>
          </div>
          <div className={styles.section}>
            <div className={styles.label}>Job ID</div>
            <div className={styles.value}>{dispute.jobId}</div>
          </div>
          <div className={styles.section}>
            <div className={styles.label}>Reason</div>
            <div className={styles.value}>{dispute.reason}</div>
          </div>
        </div>

        {dispute.details && (
          <div className={styles.section}>
            <div className={styles.label}>Details</div>
            <div className={styles.value}>{dispute.details}</div>
          </div>
        )}

        {dispute.adminNote && (
          <div className={styles.section}>
            <div className={styles.label}>Admin note</div>
            <div className={styles.value}>{dispute.adminNote}</div>
          </div>
        )}

        {dispute.status === "open" && (
          <>
            <div className={styles.noteSection}>
              <div className={styles.label}>Resolution note</div>
              <textarea
                className={styles.textarea}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Document your decision and reasoning…"
              />
            </div>
            <div className={styles.actions}>
              <button
                className={styles.resolveBtn}
                onClick={() => resolve("resolve")}
                disabled={!!loading}
              >
                {loading === "resolve" ? "Resolving…" : "Mark Resolved"}
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => resolve("cancel")}
                disabled={!!loading}
              >
                {loading === "cancel" ? "Cancelling…" : "Cancel Dispute"}
              </button>
            </div>
          </>
        )}

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
      </Card>
    </div>
  );
}
