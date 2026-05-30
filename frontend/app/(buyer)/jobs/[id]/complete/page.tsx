"use client";

import { useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";
import { apiFetch, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./complete.module.css";

type Delivery = {
  id: string;
  revisionRound: number;
  submittedBy: string;
  createdAt: string;
};

function latestDelivery(deliveries: Delivery[]) {
  return [...deliveries].sort((a, b) => {
    if (b.revisionRound !== a.revisionRound) return b.revisionRound - a.revisionRound;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  })[0];
}

export default function CompletePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useFetch<{ data: Delivery[] }>(`/jobs/${id}/deliveries`);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const latest = latestDelivery(data?.data ?? []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!latest?.submittedBy) {
      setError("Unable to identify the freelancer for this review.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch(`/jobs/${id}/reviews`, {
        method: "POST",
        body: JSON.stringify({ revieweeId: latest.submittedBy, rating, comment }),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) return <div className={styles.loading}><Spinner /></div>;

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.success}>
          <div className={styles.successIcon}>✓</div>
          <h1>Review submitted!</h1>
          <p>Thanks — your review is live.</p>
          <Button href="/jobs">Back to my jobs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Leave a review</h1>
      <p className={styles.sub}>How was the work? Your feedback helps the marketplace.</p>
      {error && <div className={styles.error}>{error}</div>}
      <Card className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} className={styles.star + (n <= rating ? " " + styles.filled : "")}>★</button>
            ))}
            <span className={styles.ratingLabel}>{rating} / 5</span>
          </div>
          <label className={styles.fieldLabel}>
            <span>Comment</span>
            <textarea
              className={styles.textarea}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Describe the quality of work, communication, and delivery…"
            />
          </label>
          <div className={styles.actions}>
            <Button variant="ghost" href="/jobs">Skip</Button>
            <Button type="submit" disabled={loading || !latest}>{loading ? "Submitting..." : "Submit review"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
