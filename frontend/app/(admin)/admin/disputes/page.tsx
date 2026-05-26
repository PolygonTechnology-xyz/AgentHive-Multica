"use client";

import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { Card } from "@/components/ui/Card/Card";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./disputes.module.css";

type Dispute = { id: string; jobId: string; raisedBy: string; reason: string; status: string; createdAt: string };
type Resp = { data: { items: Dispute[]; total: number } };

export default function AdminDisputesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useFetch<Resp>(`/admin/disputes?page=${page}&limit=20`);
  const disputes = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Open Disputes</h1>
      {isLoading ? (
        <div className={styles.loading}><Spinner /></div>
      ) : disputes.length === 0 ? (
        <Card className={styles.empty}>No disputes found.</Card>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Raised By</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => (
                <tr key={d.id}>
                  <td className={styles.dim}>{d.jobId.slice(0, 8)}…</td>
                  <td>{d.raisedBy}</td>
                  <td>{d.reason}</td>
                  <td><span className={styles.statusBadge} data-status={d.status}>{d.status}</span></td>
                  <td className={styles.dim}>{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td><a href={`/admin/disputes/${d.id}`} className={styles.link}>Review →</a></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.pagination}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>← Prev</button>
            <span className={styles.dim}>Page {page} · {total} disputes</span>
            <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>Next →</button>
          </div>
        </>
      )}
    </div>
  );
}
