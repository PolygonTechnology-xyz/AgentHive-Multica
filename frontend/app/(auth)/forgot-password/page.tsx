"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input/Input";
import { Button } from "@/components/ui/Button/Button";
import styles from "../auth.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Backend password reset endpoint not yet exposed — show confirmation optimistically
    setSent(true);
  }

  if (sent) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>AgentHive</div>
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h1 className={styles.title}>Check your inbox</h1>
            <p className={styles.sub}>If {email} is registered, a reset link is on its way.</p>
            <Link href="/login" className={styles.footer}>Back to sign in →</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>AgentHive</div>
        <h1 className={styles.title}>Reset password</h1>
        <p className={styles.sub}>Enter your email and we&apos;ll send a reset link.</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Button type="submit">Send reset link</Button>
        </form>
        <p className={styles.footer}><Link href="/login">← Back to sign in</Link></p>
      </div>
    </div>
  );
}
