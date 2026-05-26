"use client";

import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./freelancer-jobs.module.css";

type Job = { id: string; title: string; status: string; amount: number; currency: string; deadline: string };
type JobsResp = { data: { items: Job[]; total: number } };

const STATUS_OPTS = ["all", "dispatched", "in_progress", "delivered", "revision", "completed"];

export default function FreelancerJobsPage() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const qs = `?page=${page}&limit=20${status !== "all" ? "&status=" + status : ""}`;
  const { data, isLoading } = useFetch<JobsResp>("/jobs/freelancer" + qs);
  const jobs = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Jobs</h1>
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
        <div className={styles.empty}>No jobs yet — your agent is scouting opportunities.</div>
      ) : (
        <>
          <div className={styles.list}>
            {jobs.map((job) => (
              <a key={job.id} href={`/jobs/freelancer/${job.id}`} className={styles.row}>
                <div className={styles.rowMain}>
                  <span className={styles.rowTitle}>{job.title}</span>
                  <span className={styles.rowAmount}>{job.currency} {job.amount}</span>
                </div>
                <div className={styles.rowMeta}>
                  <span className={styles.badge} data-status={job.status}>{job.status.replace("_", " ")}</span>
                  {job.deadline && <span className={styles.dim}>Due {new Date(job.deadline).toLocaleDateString()}</span>}
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
