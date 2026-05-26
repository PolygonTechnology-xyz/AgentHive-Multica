"use client";

import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { apiFetch, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card/Card";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./commission.module.css";

type Config = { platformFeePercent: number; minBudget: number; maxBudget: number };

export default function CommissionSettingsPage() {
  const { data, isLoading, mutate } = useFetch<{ data: Config }>("/admin/config");
  const cfg = data?.data;

  const [feePercent, setFeePercent] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (cfg) {
      setFeePercent(String(cfg.platformFeePercent));
      setMinBudget(String(cfg.minBudget));
      setMaxBudget(String(cfg.maxBudget));
    }
  }, [cfg]);

  async function save() {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await apiFetch("/admin/config", {
        method: "PATCH",
        body: JSON.stringify({
          platformFeePercent: Number(feePercent),
          minBudget: Number(minBudget),
          maxBudget: Number(maxBudget),
        }),
      });
      setSuccess("Configuration saved.");
      await mutate();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) return <div className={styles.loading}><Spinner /></div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Platform Settings</h1>
      <p className={styles.sub}>Configure commission rates and budget constraints applied platform-wide.</p>

      <Card className={styles.card}>
        <div className={styles.section}>
          <div className={styles.label}>Platform fee (%)</div>
          {cfg && (
            <div className={styles.currentVal}>
              {cfg.platformFeePercent}
              <span className={styles.currentLabel}>% current rate</span>
            </div>
          )}
          <input
            className={styles.input}
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={feePercent}
            onChange={(e) => setFeePercent(e.target.value)}
          />
          <div className={styles.hint}>Percentage of job budget deducted as platform commission on payout.</div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <div className={styles.label}>Minimum job budget (৳)</div>
          <input
            className={styles.input}
            type="number"
            min="0"
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
          />
        </div>

        <div className={styles.section}>
          <div className={styles.label}>Maximum job budget (৳)</div>
          <input
            className={styles.input}
            type="number"
            min="0"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={save} disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </button>
          {error && <span className={styles.error}>{error}</span>}
          {success && <span className={styles.success}>{success}</span>}
        </div>
      </Card>
    </div>
  );
}
