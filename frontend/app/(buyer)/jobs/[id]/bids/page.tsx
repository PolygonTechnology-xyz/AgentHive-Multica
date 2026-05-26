"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";
import { apiFetch, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./bids.module.css";

type Job = { id: string; title: string; description: string; status: string; budget_min: number; budget_max: number; currency: string };
type Bid = { id: string; bidderId: string; amount: number; currency: string; coverLetter: string; deliveryDays: number; matchScore?: number; status: string; source: string; createdAt: string };

export default function BidsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: jobData, isLoading: jobLoading } = useFetch<{ data: Job }>(`/jobs/${id}`);
  const { data: bidsData, isLoading: bidsLoading, mutate } = useFetch<{ data: Bid[] }>(`/bids?jobId=${id}`);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const job = jobData?.data;
  const bids = bidsData?.data ?? [];

  async function acceptBid(bidId: string) {
    setAccepting(bidId);
    setError("");
    try {
      await apiFetch(`/bids/${bidId}/accept`, { method: "PATCH" });
      await mutate();
      router.push(`/jobs/${id}/payment`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to accept bid");
    } finally {
      setAccepting(null);
    }
  }

  if (jobLoading) return <div className={styles.loading}><Spinner /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}><a href="/jobs">← My Jobs</a></div>
      {job && (
        <Card className={styles.jobCard}>
          <div className={styles.jobHeader}>
            <div>
              <h1 className={styles.jobTitle}>{job.title}</h1>
              <span className={styles.badge} data-status={job.status}>{job.status.replace("_", " ")}</span>
            </div>
            <span className={styles.budget}>{job.currency} {job.budget_min}–{job.budget_max}</span>
          </div>
          <p className={styles.desc}>{job.description}</p>
        </Card>
      )}

      <div className={styles.bidsHeader}>
        <h2 className={styles.sectionTitle}>Bids {bids.length > 0 ? `(${bids.length})` : ""}</h2>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {bidsLoading ? (
        <div className={styles.loading}><Spinner /></div>
      ) : bids.length === 0 ? (
        <div className={styles.empty}>No bids yet — AI agents are reviewing your job.</div>
      ) : (
        <div className={styles.bidList}>
          {bids.map((bid) => (
            <Card key={bid.id} className={styles.bidCard}>
              <div className={styles.bidHeader}>
                <div className={styles.bidAmount}>{bid.currency} {bid.amount}</div>
                <div className={styles.bidMeta}>
                  {bid.matchScore != null && <span className={styles.score}>Match {bid.matchScore}%</span>}
                  <span className={styles.source + (bid.source === "AUTO" ? " " + styles.auto : "")}>{bid.source}</span>
                  <span className={styles.dim}>{bid.deliveryDays}d delivery</span>
                </div>
              </div>
              {bid.coverLetter && <p className={styles.cover}>{bid.coverLetter}</p>}
              <div className={styles.bidActions}>
                <span className={styles.dim}>{new Date(bid.createdAt).toLocaleDateString()}</span>
                {job?.status === "open" || job?.status === "in_bidding" ? (
                  bid.status === "pending" ? (
                    <Button
                      disabled={!!accepting}
                      onClick={() => acceptBid(bid.id)}
                    >
                      {accepting === bid.id ? "Accepting…" : "Accept bid"}
                    </Button>
                  ) : (
                    <span className={styles.badge} data-status={bid.status}>{bid.status}</span>
                  )
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
