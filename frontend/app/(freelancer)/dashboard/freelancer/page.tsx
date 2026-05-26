"use client";

import { useFetch } from "@/hooks/useFetch";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./dashboard.module.css";

type Agent = { id: string; status: string; score: number; autoBidEnabled: boolean };
type Job = { id: string; title: string; status: string; amount: number; currency: string };

export default function FreelancerDashboardPage() {
  const { data: agentData, isLoading: agentLoading } = useFetch<{ data: Agent }>("/bidder-agent/me");
  const { data: jobsData, isLoading: jobsLoading } = useFetch<{ data: { items: Job[] } }>("/jobs/freelancer?limit=5");

  const agent = agentData?.data;
  const jobs = jobsData?.data?.items ?? [];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Freelancer Dashboard</h1>
        <Button href="/configuration" variant="ghost">Configure agent</Button>
      </div>

      <div className={styles.agentRow}>
        {agentLoading ? (
          <Card className={styles.agentCard}><Spinner /></Card>
        ) : agent ? (
          <Card className={styles.agentCard}>
            <div className={styles.agentHeader}>
              <div>
                <div className={styles.agentTitle}>Bidder Agent</div>
                <div className={styles.dim}>Auto-bids on matching jobs</div>
              </div>
              <span className={styles.statusBadge} data-status={agent.status}>{agent.status}</span>
            </div>
            <div className={styles.agentStats}>
              <div>
                <div className={styles.statVal}>{agent.autoBidEnabled ? "On" : "Off"}</div>
                <div className={styles.statLabel}>Auto-bid</div>
              </div>
              <div>
                <div className={styles.statVal}>{agent.score ?? "—"}</div>
                <div className={styles.statLabel}>Score threshold</div>
              </div>
            </div>
            <Button href="/configuration" variant="ghost">Edit config</Button>
          </Card>
        ) : (
          <Card className={styles.agentCard}>
            <p className={styles.dim}>No agent found. Contact support.</p>
          </Card>
        )}
      </div>

      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Active work</h2>
          <Button href="/jobs/freelancer" variant="ghost">View all</Button>
        </div>
        {jobsLoading ? (
          <div className={styles.loading}><Spinner /></div>
        ) : jobs.length === 0 ? (
          <Card className={styles.empty}>No active jobs. Your agent is waiting for matching opportunities.</Card>
        ) : (
          <div className={styles.list}>
            {jobs.map((job) => (
              <a key={job.id} href={`/jobs/freelancer/${job.id}`} className={styles.row}>
                <span className={styles.rowTitle}>{job.title}</span>
                <span className={styles.rowAmount}>{job.currency} {job.amount}</span>
                <span className={styles.badge} data-status={job.status}>{job.status.replace("_", " ")}</span>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
