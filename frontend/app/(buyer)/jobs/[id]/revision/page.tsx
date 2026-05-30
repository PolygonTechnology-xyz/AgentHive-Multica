"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";
import { apiFetch, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card/Card";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./revision.module.css";

type Delivery = {
  id: string;
  revisionRound: number;
  status: "submitted" | "approved" | "revision_requested";
  createdAt: string;
};

function latestDelivery(deliveries: Delivery[]) {
  return [...deliveries].sort((a, b) => {
    if (b.revisionRound !== a.revisionRound) return b.revisionRound - a.revisionRound;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  })[0];
}

export default function RevisionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useFetch<{ data: Delivery[] }>(`/jobs/${id}/deliveries`);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const latest = latestDelivery(data?.data ?? []);

  async function submit() {
    if (note.trim().length < 10) {
      setError("Revision notes must be at least 10 characters.");
      return;
    }
    if (!latest) { setError("No delivery found."); return; }
    setLoading(true);
    setError("");
    try {
      await apiFetch(`/deliveries/${latest.id}/request-revision`, {
        method: "POST",
        body: JSON.stringify({ reason: note }),
      });
      router.push(`/jobs/${id}/progress`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) return <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}><a href={`/jobs/${id}/delivery`}>← Back to delivery</a></div>
      <h1 className={styles.title}>Request revision</h1>
      <p className={styles.sub}>
        Describe what needs to change. Round {latest ? latest.revisionRound + 1 : 1} will begin after submission.
      </p>

      <Card className={styles.card}>
        <div className={styles.label}>Revision notes</div>
        <textarea
          className={styles.textarea}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Be specific — what's missing, what's wrong, what should be different…"
        />
        <div className={styles.actions}>
          <button className={styles.submitBtn} onClick={submit} disabled={loading || !latest}>
            {loading ? "Submitting..." : "Submit revision request"}
          </button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
      </Card>
    </div>
  );
}
