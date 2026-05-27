"use client";

import { useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";
import { apiFetch, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./job-detail.module.css";

type Job = { id: string; title: string; description: string; status: string; budgetMin: number; budgetMax: number; currency: string; deadline: string };
type Delivery = { id: string; note: string; status: string; revisionRound: number; createdAt: string };

export default function FreelancerJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: jobData, isLoading } = useFetch<{ data: Job }>(`/jobs/${id}`);
  const { data: deliveryData, mutate } = useFetch<{ data: Delivery[] }>(`/deliveries?jobId=${id}`);

  const [note, setNote] = useState("");
  const [attachments, setAttachments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const job = jobData?.data;
  const deliveries = deliveryData?.data ?? [];

  async function submitDelivery(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const urls = attachments.split("\n").map((u) => u.trim()).filter(Boolean);
      await apiFetch("/deliveries", {
        method: "POST",
        body: JSON.stringify({ jobId: id, note, attachmentUrls: urls }),
      });
      await mutate();
      setNote("");
      setAttachments("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit delivery");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return <div className={styles.loading}><Spinner /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}><a href="/jobs/freelancer">← My Jobs</a></div>
      {job && (
        <Card className={styles.jobCard}>
          <div className={styles.jobHeader}>
            <div>
              <h1 className={styles.jobTitle}>{job.title}</h1>
              <span className={styles.badge} data-status={job.status}>{job.status.replace("_", " ")}</span>
            </div>
            <span className={styles.budget}>{job.currency} {job.budgetMin}–{job.budgetMax}</span>
          </div>
          <p className={styles.desc}>{job.description}</p>
          {job.deadline && <p className={styles.dim}>Deadline: {new Date(job.deadline).toLocaleDateString()}</p>}
        </Card>
      )}

      {deliveries.length > 0 && (
        <div className={styles.history}>
          <h2 className={styles.sectionTitle}>Delivery history</h2>
          {deliveries.map((d) => (
            <Card key={d.id} className={styles.deliveryCard}>
              <div className={styles.deliveryMeta}>
                <span className={styles.round}>Round {d.revisionRound + 1}</span>
                <span className={styles.badge} data-status={d.status}>{d.status}</span>
                <span className={styles.dim}>{new Date(d.createdAt).toLocaleDateString()}</span>
              </div>
              <p className={styles.deliveryNote}>{d.note}</p>
            </Card>
          ))}
        </div>
      )}

      {(job?.status === "in_progress" || job?.status === "revision") && (
        <Card className={styles.submitCard}>
          <h2 className={styles.sectionTitle}>
            {job.status === "revision" ? "Submit revised delivery" : "Submit delivery"}
          </h2>
          {error && <div className={styles.error}>{error}</div>}
          <form className={styles.form} onSubmit={submitDelivery}>
            <label className={styles.fieldLabel}>
              <span>Delivery note</span>
              <textarea
                className={styles.textarea}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
                rows={5}
                placeholder="Describe what you've delivered, how to access it, any notes for the buyer…"
              />
            </label>
            <label className={styles.fieldLabel}>
              <span>Attachment URLs (one per line)</span>
              <textarea
                className={styles.textarea}
                value={attachments}
                onChange={(e) => setAttachments(e.target.value)}
                rows={3}
                placeholder="https://github.com/you/project&#10;https://your-preview.vercel.app"
              />
            </label>
            <Button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit delivery"}</Button>
          </form>
        </Card>
      )}
    </div>
  );
}
