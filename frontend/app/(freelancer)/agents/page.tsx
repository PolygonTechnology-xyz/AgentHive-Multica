"use client";

import { useFetch } from "@/hooks/useFetch";
import { apiFetch, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card/Card";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./agents.module.css";

type Agent = {
  id: string;
  name: string;
  status: "active" | "paused" | "idle";
  autoBid: boolean;
  scoreThreshold: number;
  bidsPlaced: number;
  bidsWon: number;
  createdAt: string;
};

export default function AgentsPage() {
  const { data, isLoading, mutate } = useFetch<{ data: Agent[] }>("/bidder-agent/list");
  const agents = data?.data ?? [];

  async function togglePause(agent: Agent) {
    const action = agent.status === "active" ? "pause" : "resume";
    try {
      await apiFetch(`/bidder-agent/${agent.id}/${action}`, { method: "PATCH" });
      await mutate();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Action failed");
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Agents</h1>
      <p className={styles.sub}>AI bidding agents configured to win jobs on your behalf.</p>

      {isLoading ? (
        <div className={styles.loading}><Spinner /></div>
      ) : agents.length === 0 ? (
        <Card className={styles.empty}>
          No agents yet. Complete onboarding to provision your bidder agent.
        </Card>
      ) : (
        <div className={styles.grid}>
          {agents.map((agent) => (
            <Card key={agent.id} className={styles.agentCard}>
              <div className={styles.agentHeader}>
                <div className={styles.agentName}>{agent.name || "Bidder Agent"}</div>
                <span className={styles.statusBadge} data-status={agent.status}>{agent.status}</span>
              </div>

              <div className={styles.row}>
                <span className={styles.rowLabel}>Auto-bid</span>
                <span className={styles.rowVal}>{agent.autoBid ? "Enabled" : "Disabled"}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Score threshold</span>
                <span className={styles.rowVal}>{agent.scoreThreshold}%</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Provisioned</span>
                <span className={styles.rowVal}>{new Date(agent.createdAt).toLocaleDateString()}</span>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatVal}>{agent.bidsPlaced ?? 0}</div>
                  <div className={styles.miniStatLabel}>Bids placed</div>
                </div>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatVal}>{agent.bidsWon ?? 0}</div>
                  <div className={styles.miniStatLabel}>Bids won</div>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.actionBtn + " " + (agent.status === "active" ? styles.pauseBtn : styles.resumeBtn)}
                  onClick={() => togglePause(agent)}
                >
                  {agent.status === "active" ? "Pause" : "Resume"}
                </button>
                <a href="/configuration" className={styles.configLink}>Configure →</a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
