"use client";

import { useParams } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./progress.module.css";

type Job = { id: string; title: string; status: string; currency: string };
type Delivery = { id: string; note: string; revisionRound: number; status: string; createdAt: string };

const STEPS = ["dispatched", "in_progress", "delivered", "completed"];

export default function ProgressPage() {
  const { id } = useParams<{ id: string }>();
  const { data: jobData, isLoading } = useFetch<{ data: Job }>(`/jobs/${id}`);
  const { data: deliveryData } = useFetch<{ data: Delivery[] }>(`/deliveries?jobId=${id}`);

  const job = jobData?.data;
  const latestDelivery = deliveryData?.data?.[0];

  if (isLoading) return <div className={styles.loading}><Spinner /></div>;

  const stepIdx = job ? STEPS.indexOf(job.status) : -1;

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}><a href="/jobs">← My Jobs</a></div>
      <h1 className={styles.title}>{job?.title ?? "Job progress"}</h1>

      <Card className={styles.card}>
        <div className={styles.steps}>
          {STEPS.map((step, i) => (
            <div key={step} className={styles.step + (i <= stepIdx ? " " + styles.done : "")}>
              <div className={styles.dot}>{i <= stepIdx ? "✓" : i + 1}</div>
              <div className={styles.stepLabel}>{step.replace("_", " ")}</div>
            </div>
          ))}
        </div>
      </Card>

      {latestDelivery && (job?.status === "delivered" || job?.status === "revision") && (
        <Card className={styles.deliveryCard}>
          <h2 className={styles.sectionTitle}>Latest delivery</h2>
          <p className={styles.deliveryNote}>{latestDelivery.note}</p>
          <Button href={`/jobs/${id}/delivery`}>Review delivery →</Button>
        </Card>
      )}

      {job?.status === "completed" && (
        <Card className={styles.doneCard}>
          <div className={styles.doneIcon}>✓</div>
          <h2 className={styles.sectionTitle}>Job completed!</h2>
          <p className={styles.dim}>Payment has been released to the freelancer.</p>
          <Button href={`/jobs/${id}/complete`} variant="ghost">Leave a review</Button>
        </Card>
      )}
    </div>
  );
}
