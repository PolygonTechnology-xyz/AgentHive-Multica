"use client";

import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { Card } from "@/components/ui/Card/Card";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./payments.module.css";

type Payment = { id: string; jobId: string; jobTitle: string; amount: number; platformFee: number; status: string; createdAt: string };
type Resp = { data: { items: Payment[]; total: number; totalSpent: number; totalHeld: number } };

export default function BuyerPaymentsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useFetch<Resp>(`/payments?page=${page}&limit=20`);
  const payments = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalSpent = data?.data?.totalSpent ?? 0;
  const totalHeld = data?.data?.totalHeld ?? 0;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Payment history</h1>
      <p className={styles.sub}>All escrow transactions for your jobs.</p>

      {isLoading ? (
        <div className={styles.loading}><Spinner /></div>
      ) : (
        <>
          <div className={styles.summary}>
            <Card className={styles.stat}>
              <div className={styles.statVal}>৳{Number(totalSpent).toLocaleString()}</div>
              <div className={styles.statLabel}>Total spent</div>
            </Card>
            <Card className={styles.stat}>
              <div className={styles.statVal}>৳{Number(totalHeld).toLocaleString()}</div>
              <div className={styles.statLabel}>In escrow</div>
            </Card>
            <Card className={styles.stat}>
              <div className={styles.statVal}>{total}</div>
              <div className={styles.statLabel}>Total transactions</div>
            </Card>
          </div>

          {payments.length === 0 ? (
            <Card className={styles.empty}>No payments yet. Fund a job to get started.</Card>
          ) : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Amount</th>
                    <th>Platform fee</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <a href={`/jobs/${p.jobId}/progress`} className={styles.jobLink}>
                          {p.jobTitle || p.jobId.slice(0, 8) + "…"}
                        </a>
                      </td>
                      <td className={styles.amount}>৳{Number(p.amount).toLocaleString()}</td>
                      <td className={styles.dim}>৳{Number(p.platformFee).toLocaleString()}</td>
                      <td><span className={styles.statusBadge} data-status={p.status}>{p.status}</span></td>
                      <td className={styles.dim}>{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.pagination}>
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>← Prev</button>
                <span className={styles.dim}>Page {page} · {total} transactions</span>
                <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>Next →</button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
