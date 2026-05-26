"use client";

import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { apiFetch, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card/Card";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./profile.module.css";

type Profile = { id: string; email: string; displayName: string; bio: string; skills: string[]; handle: string };

export default function FreelancerAccountPage() {
  const { data, isLoading, mutate } = useFetch<{ data: Profile }>("/users/me");
  const profile = data?.data;

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setBio(profile.bio ?? "");
      setSkills((profile.skills ?? []).join(", "));
      setHandle(profile.handle ?? "");
    }
  }, [profile]);

  async function save() {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          displayName,
          bio,
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          handle,
        }),
      });
      setSuccess("Profile updated.");
      await mutate();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) return <div className={styles.loading}><Spinner /></div>;

  const initials = (displayName || profile?.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My profile</h1>

      <Card className={styles.card}>
        <div className={styles.avatar}>
          <div className={styles.avatarCircle}>{initials}</div>
          <div>
            <div className={styles.avatarName}>{profile?.displayName || "—"}</div>
            <div className={styles.avatarEmail}>{profile?.email}</div>
          </div>
        </div>

        <div className={styles.sectionTitle}>Public profile</div>

        <div className={styles.field}>
          <div className={styles.label}>Display name</div>
          <input className={styles.input} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your full name" />
        </div>

        <div className={styles.field}>
          <div className={styles.label}>Handle</div>
          <input className={styles.input} value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="your-handle" />
          <div className={styles.hint}>Public profile URL: /freelancer/{handle || "your-handle"}</div>
        </div>

        <div className={styles.field}>
          <div className={styles.label}>Bio</div>
          <textarea className={styles.textarea} rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell buyers about yourself…" />
        </div>

        <div className={styles.field}>
          <div className={styles.label}>Skills</div>
          <input className={styles.input} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. React, Node.js, Python" />
          <div className={styles.hint}>Comma-separated. Used by AI agent for bid matching.</div>
        </div>

        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={save} disabled={loading}>
            {loading ? "Saving…" : "Save profile"}
          </button>
          {error && <span className={styles.error}>{error}</span>}
          {success && <span className={styles.success}>{success}</span>}
        </div>
      </Card>
    </div>
  );
}
