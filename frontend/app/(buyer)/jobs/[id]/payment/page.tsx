"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";
import { apiFetch, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./payment.module.css";

type Job = { id: string; title: string; status: string; currency: string };
type Bid = { id: string; amount: number; currency: string; deliveryDays: number };

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: jobData, isLoading: jobLoading } = useFetch<{ data: Job }>(`/jobs/${id}`);
  const { data: bidsData, isLoading: bidsLoading } = useFetch<{ data: Bid[] }>(`/bids?jobId=${id}&status=accepted`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const job = jobData?.data;
  const acceptedBid = bidsData?.data?.[0];
  const fee = acceptedBid ? Number((acceptedBid.amount * 0.1).toFixed(2)) : 0;
  const total = acceptedBid ? Number(acceptedBid.amount) + fee : 0;

  async function fundEscrow() {
    setError("");
    setLoading(true);
    try {
      await apiFetch("/payments/fund", {
        method: "POST",
        body: JSON.stringify({ jobId: id }),
      });
      router.push(`/jobs/${id}/payment/success`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Payment failed");
      router.push(`/jobs/${id}/payment/failed`);
    } finally {
      setLoading(false);
    }
  }

  if (jobLoading || bidsLoading) return <div className={styles.loading}><Spinner /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}><a href={`/jobs/${id}/bids`}>← Back to bids</a></div>
      <h1 className={styles.title}>Fund escrow</h1>
      <p className={styles.sub}>Payment is held securely and released when you approve the work.</p>

      {error && <div className={styles.error}>{error}</div>}

      {acceptedBid ? (
        <Card className={styles.card}>
          <div className={styles.jobTitle}>{job?.title}</div>
          <div className={styles.breakdown}>
            <div className={styles.row}>
              <span>Freelancer payment</span>
              <span>{acceptedBid.currency} {acceptedBid.amount}</span>
            </div>
            <div className={styles.row}>
              <span>Platform fee (10%)</span>
              <span>{acceptedBid.currency} {fee}</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.row + " " + styles.total}>
              <span>Total to hold in escrow</span>
              <span>{acceptedBid.currency} {total}</span>
            </div>
          </div>
          <div className={styles.note}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Funds will be released to the freelancer only after you approve the delivery.
          </div>
          <Button onClick={fundEscrow} disabled={loading}>
            {loading ? "Processing…" : `Pay ${acceptedBid.currency} ${total} to escrow`}
          </Button>
        </Card>
      ) : (
        <Card className={styles.card}>
          <p className={styles.sub}>No accepted bid found for this job.</p>
          <Button href={`/jobs/${id}/bids`} variant="ghost">← Back to bids</Button>
        </Card>
      )}
    </div>
  );
}
