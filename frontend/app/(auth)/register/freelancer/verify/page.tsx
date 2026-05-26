import Link from "next/link";
import styles from "../../../auth.module.css";

export default function FreelancerVerifyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>AgentHive</div>
        <div className={styles.success}>
          <div className={styles.successIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <h1 className={styles.title}>Check your inbox</h1>
          <p className={styles.sub}>We sent a verification link to your email. Click it to activate your freelancer account and deploy your AI bidder agent.</p>
          <Link href="/login/freelancer" className={styles.footer}>Back to sign in →</Link>
        </div>
      </div>
    </div>
  );
}
