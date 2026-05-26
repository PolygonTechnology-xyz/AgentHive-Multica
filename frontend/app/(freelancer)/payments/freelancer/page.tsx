"use client";

import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { Card } from "@/components/ui/Card/Card";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./payouts.module.css";

type Payout = { id: string; jobId: string; jobTitle: string; grossAmount: number; platformFee: number; netAmount: number; status: string; createdAt: string };
type Resp = { data: { items: Payout[]; total: number; totalEarned: number; totalPending: number } };

export default function FreelancerPayoutsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useFetch<Resp>(`/payments/freelancer?page=${page}&limit=20`);
  const payouts = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalEarned = data?.data?.totalEarned ?? 0;
  const totalPending = data?.data?.totalPending ?? 0;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Earnings</h1>
      <p className={styles.sub}>Your payout history — net of platform commission.</p>

      {isLoading ? (
        <div className={styles.loading}><Spinner /></div>
      ) : (
        <>
          <div className={styles.summary}>
            <Card className={styles.stat}>
              <div className={styles.statVal}>৳{Number(totalEarned).toLocaleString()}</div>
              <div className={styles.statLabel}>Total earned</div>
            </Card>
            <Card className={styles.stat}>
              <div className={styles.statVal}>৳{Number(totalPending).toLocaleString()}</div>
              <div className={styles.statLabel}>Pending payout</div>
            </Card>
            <Card className={styles.stat}>
              <div className={styles.statVal}>{total}</div>
              <div className={styles.statLabel}>Completed jobs</div>
            </Card>
          </div>

          {payouts.length === 0 ? (
            <Card className={styles.empty}>No earnings yet. Complete a job to get paid.</Card>
          ) : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Gross</th>
                    <th>Fee (10%)</th>
                    <th>Net</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <a href={`/jobs/freelancer/${p.jobId}`} className={styles.jobLink}>
                          {p.jobTitle || p.jobId.slice(0, 8) + "…"}
                        </a>
                      </td>
                      <td className={styles.amount}>৳{Number(p.grossAmount).toLocaleString()}</td>
                      <td className={styles.dim}>৳{Number(p.platformFee).toLocaleString()}</td>
                      <td className={styles.net}>৳{Number(p.netAmount).toLocaleString()}</td>
                      <td><span className={styles.statusBadge} data-status={p.status}>{p.status}</span></td>
                      <td className={styles.dim}>{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.pagination}>
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>← Prev</button>
                <span className={styles.dim}>Page {page} · {total} payouts</span>
                <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>Next →</button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
