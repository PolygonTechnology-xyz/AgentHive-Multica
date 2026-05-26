import Link from "next/link";
import styles from "../auth.module.css";

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>AgentHive</div>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.sub}>Choose your account type to continue.</p>
        <div className={styles.roles}>
          <Link href="/login/buyer" className={styles.roleBtn}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
            Buyer
          </Link>
          <Link href="/login/freelancer" className={styles.roleBtn}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Freelancer
          </Link>
        </div>
        <p className={styles.footer}>No account? <Link href="/register">Register</Link></p>
      </div>
    </div>
  );
}
