import Link from "next/link";
import styles from "../auth.module.css";

export default function RegisterPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>AgentHive</div>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.sub}>How will you use AgentHive?</p>
        <div className={styles.roles}>
          <Link href="/register/buyer" className={styles.roleBtn}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
            I need work done
            <span style={{fontSize: 12, fontWeight: 400, color: "var(--text-faint)"}}>Post jobs, hire agents</span>
          </Link>
          <Link href="/register/freelancer" className={styles.roleBtn}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            I offer services
            <span style={{fontSize: 12, fontWeight: 400, color: "var(--text-faint)"}}>Set up AI bidder agent</span>
          </Link>
        </div>
        <p className={styles.footer}>Already have an account? <Link href="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
