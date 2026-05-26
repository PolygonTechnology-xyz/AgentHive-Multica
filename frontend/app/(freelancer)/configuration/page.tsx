"use client";

import { useState, useEffect, FormEvent } from "react";
import { useFetch } from "@/hooks/useFetch";
import { apiFetch, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card/Card";
import { Input } from "@/components/ui/Input/Input";
import { Button } from "@/components/ui/Button/Button";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./configuration.module.css";

type AgentConfig = { id: string; status: string; autoBidEnabled: boolean; scoreThreshold: number; nlConfig: string };

export default function ConfigurationPage() {
  const { data, isLoading, mutate } = useFetch<{ data: AgentConfig }>("/bidder-agent/me");
  const agent = data?.data;

  const [nlConfig, setNlConfig] = useState("");
  const [threshold, setThreshold] = useState(60);
  const [autoBid, setAutoBid] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (agent) {
      setNlConfig(agent.nlConfig ?? "");
      setThreshold(agent.scoreThreshold ?? 60);
      setAutoBid(agent.autoBidEnabled ?? true);
    }
  }, [agent]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await apiFetch(`/bidder-agent/${agent?.id}/config`, {
        method: "PATCH",
        body: JSON.stringify({ nlConfig, scoreThreshold: threshold, autoBidEnabled: autoBid }),
      });
      await mutate();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save config");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <div className={styles.loading}><Spinner /></div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Bidder Agent Configuration</h1>
      <p className={styles.sub}>Your agent uses these settings to decide which jobs to bid on automatically.</p>

      {error && <div className={styles.error}>{error}</div>}
      {saved && <div className={styles.successMsg}>✓ Configuration saved</div>}

      <form onSubmit={handleSave} className={styles.form}>
        <Card className={styles.card}>
          <h2 className={styles.sectionTitle}>Natural language config</h2>
          <p className={styles.hint}>Describe your preferences in plain English. The agent parses this to set bidding rules.</p>
          <textarea
            className={styles.textarea}
            value={nlConfig}
            onChange={(e) => setNlConfig(e.target.value)}
            rows={6}
            placeholder={`Examples:\n• "I specialize in React and Node.js web development. Budget between 500 and 2000 BDT. Prefer jobs with at least 3 days deadline."\n• "Only bid on design and UI projects. Don't bid below 300 BDT."`}
          />
        </Card>

        <Card className={styles.card}>
          <h2 className={styles.sectionTitle}>Scoring settings</h2>
          <div className={styles.row2}>
            <div>
              <label className={styles.fieldLabel}>Score threshold (0–100)</label>
              <div className={styles.sliderRow}>
                <input
                  type="range" min={0} max={100}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className={styles.slider}
                />
                <span className={styles.sliderVal}>{threshold}</span>
              </div>
              <p className={styles.hint}>Only bid when match score ≥ {threshold}. Higher = more selective.</p>
            </div>
            <div>
              <label className={styles.fieldLabel}>Auto-bid</label>
              <button
                type="button"
                className={styles.toggle + (autoBid ? " " + styles.on : "")}
                onClick={() => setAutoBid((v) => !v)}
              >
                <span className={styles.thumb} />
                <span className={styles.toggleLabel}>{autoBid ? "Enabled" : "Disabled"}</span>
              </button>
              <p className={styles.hint}>{autoBid ? "Agent bids automatically when score ≥ threshold." : "Agent scores jobs but never bids without your approval."}</p>
            </div>
          </div>
        </Card>

        <div className={styles.saveRow}>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save configuration"}</Button>
        </div>
      </form>
    </div>
  );
}
