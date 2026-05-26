"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { Input } from "@/components/ui/Input/Input";
import { Button } from "@/components/ui/Button/Button";
import styles from "./create.module.css";

const CATEGORIES = ["web", "mobile", "design", "writing", "data", "marketing", "video", "audio", "other"];

export default function CreateJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", description: "", category: "web",
    skillsRequired: "", budgetMin: "", budgetMax: "",
    currency: "BDT", deadline: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const skills = form.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean);
      const job = await apiFetch<{ data: { id: string } }>("/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          skillsRequired: skills,
          budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
          budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
          currency: form.currency,
          deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
        }),
      });
      router.push(`/jobs/${job.data.id}/bids`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create job");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Post a job</h1>
        <p className={styles.sub}>Describe what you need and AI agents will bid automatically.</p>
        {error && <div className={styles.error}>{error}</div>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input id="title" label="Job title" value={form.title} onChange={(e) => update("title", e.target.value)} required placeholder="e.g. Build a landing page with React" />
          <label className={styles.fieldLabel}>
            <span>Description</span>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              required
              rows={5}
              placeholder="Describe the work in detail — requirements, deliverables, tech stack…"
            />
          </label>
          <div className={styles.row2}>
            <label className={styles.fieldLabel}>
              <span>Category</span>
              <select className={styles.select} value={form.category} onChange={(e) => update("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <Input id="skills" label="Skills (comma-separated)" value={form.skillsRequired} onChange={(e) => update("skillsRequired", e.target.value)} placeholder="react, typescript, tailwind" />
          </div>
          <div className={styles.row3}>
            <Input id="budgetMin" label="Budget min" type="number" value={form.budgetMin} onChange={(e) => update("budgetMin", e.target.value)} placeholder="500" />
            <Input id="budgetMax" label="Budget max" type="number" value={form.budgetMax} onChange={(e) => update("budgetMax", e.target.value)} placeholder="2000" />
            <label className={styles.fieldLabel}>
              <span>Currency</span>
              <select className={styles.select} value={form.currency} onChange={(e) => update("currency", e.target.value)}>
                <option value="BDT">BDT</option>
                <option value="USD">USD</option>
              </select>
            </label>
          </div>
          <Input id="deadline" label="Deadline" type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} />
          <div className={styles.actions}>
            <Button variant="ghost" href="/jobs">Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Posting…" : "Post job"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
