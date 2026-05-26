"use client";

import { useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import styles from "./complete.module.css";

export default function CompletePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/reviews", {
        method: "POST",
        body: JSON.stringify({ jobId: id, rating, comment }),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.success}>
          <div className={styles.successIcon}>✓</div>
          <h1>Review submitted!</h1>
          <p>Payment has been released and the job is complete.</p>
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
            <Button type="submit" disabled={loading}>{loading ? "Submitting…" : "Submit review"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
