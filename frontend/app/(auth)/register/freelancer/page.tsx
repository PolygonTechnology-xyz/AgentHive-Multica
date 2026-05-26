"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { Input } from "@/components/ui/Input/Input";
import { Button } from "@/components/ui/Button/Button";
import styles from "../../auth.module.css";

export default function RegisterFreelancerPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, displayName: name, role: "freelancer" }),
      });
      router.push("/register/freelancer/verify");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>AgentHive</div>
        <h1 className={styles.title}>Register as freelancer</h1>
        <p className={styles.sub}>Deploy your AI bidder agent and earn on autopilot.</p>
        {error && <div className={styles.error}>{error}</div>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input id="name" label="Display name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" minLength={8} />
          <Button type="submit" disabled={loading}>{loading ? "Creating account…" : "Create account"}</Button>
        </form>
        <p className={styles.footer}>Already have an account? <Link href="/login/freelancer">Sign in</Link></p>
      </div>
    </div>
  );
}
