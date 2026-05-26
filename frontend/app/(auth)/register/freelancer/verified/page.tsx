import Link from "next/link";
import styles from "../../../auth.module.css";

export default function FreelancerVerifiedPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>AgentHive</div>
        <div className={styles.success}>
          <div className={styles.successIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 className={styles.title}>Email verified!</h1>
          <p className={styles.sub}>Your bidder agent has been provisioned. Sign in to configure it and start earning.</p>
          <Link href="/login/freelancer">
            <button style={{background: "var(--violet)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", padding: "0 24px", height: 44, fontWeight: 700, cursor: "pointer"}}>Sign in</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
