"use client";

import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { Button } from "@/components/ui/Button/Button";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./jobs.module.css";

type Job = { id: string; title: string; status: string; bid_count: number; budget_min: number; budget_max: number; currency: string; created_at: string };
type JobsResp = { data: { items: Job[]; total: number } };

const STATUS_OPTS = ["all", "open", "in_bidding", "in_progress", "completed", "cancelled"];

export default function BuyerJobsPage() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const qs = `?page=${page}&limit=20${status !== "all" ? "&status=" + status : ""}`;
  const { data, isLoading } = useFetch<JobsResp>("/jobs" + qs);
  const jobs = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Jobs</h1>
        <Button href="/jobs/create">+ Post job</Button>
      </div>
      <div className={styles.filters}>
        {STATUS_OPTS.map((s) => (
          <button key={s} className={styles.filter + (status === s ? " " + styles.active : "")} onClick={() => { setStatus(s); setPage(1); }}>
            {s === "all" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className={styles.loading}><Spinner /></div>
      ) : jobs.length === 0 ? (
        <div className={styles.empty}>No jobs found. <a href="/jobs/create">Post your first job →</a></div>
      ) : (
        <>
          <div className={styles.list}>
            {jobs.map((job) => (
              <a key={job.id} href={`/jobs/${job.id}/bids`} className={styles.row}>
                <div className={styles.rowMain}>
                  <span className={styles.rowTitle}>{job.title}</span>
                  <span className={styles.rowBudget}>{job.currency} {job.budget_min}–{job.budget_max}</span>
                </div>
                <div className={styles.rowMeta}>
                  <span className={styles.badge} data-status={job.status}>{job.status.replace("_", " ")}</span>
                  <span className={styles.dim}>{job.bid_count ?? 0} bids</span>
                  <span className={styles.dim}>{new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </a>
            ))}
          </div>
          <div className={styles.pagination}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>← Prev</button>
            <span className={styles.dim}>Page {page} · {total} total</span>
            <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>Next →</button>
          </div>
        </>
      )}
    </div>
  );
}
