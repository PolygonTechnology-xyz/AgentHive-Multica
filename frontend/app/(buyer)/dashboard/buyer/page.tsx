"use client";

import { useFetch } from "@/hooks/useFetch";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./dashboard.module.css";

type StatsData = { data: { active: number; bids: number; completed: number; spent: number } };
type JobsData = { data: { items: Array<{ id: string; title: string; status: string; bid_count: number; created_at: string }> } };

export default function BuyerDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useFetch<StatsData>("/jobs/stats");
  const { data: jobs, isLoading: jobsLoading } = useFetch<JobsData>("/jobs?limit=5");

  const s = stats?.data ?? { active: 0, bids: 0, completed: 0, spent: 0 };
  const recentJobs = jobs?.data?.items ?? [];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Buyer Dashboard</h1>
        <Button href="/jobs/create">+ Post new job</Button>
      </div>

      <div className={styles.stats}>
        {[
          { label: "Active jobs", value: statsLoading ? "—" : s.active },
          { label: "Total bids", value: statsLoading ? "—" : s.bids },
          { label: "Completed", value: statsLoading ? "—" : s.completed },
          { label: "Total spent", value: statsLoading ? "—" : `৳${Number(s.spent).toLocaleString()}` },
        ].map((stat) => (
          <Card key={stat.label} className={styles.stat}>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </Card>
        ))}
      </div>

      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent jobs</h2>
          <Button href="/jobs" variant="ghost">View all</Button>
        </div>
        {jobsLoading ? (
          <div className={styles.loading}><Spinner /></div>
        ) : recentJobs.length === 0 ? (
          <Card className={styles.empty}>
            <p>No jobs yet. <a href="/jobs/create">Post your first job →</a></p>
          </Card>
        ) : (
          <div className={styles.jobList}>
            {recentJobs.map((job) => (
              <a key={job.id} href={`/jobs/${job.id}/bids`} className={styles.jobRow}>
                <span className={styles.jobTitle}>{job.title}</span>
                <span className={styles.jobStatus} data-status={job.status}>{job.status}</span>
                <span className={styles.jobBids}>{job.bid_count ?? 0} bids</span>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
