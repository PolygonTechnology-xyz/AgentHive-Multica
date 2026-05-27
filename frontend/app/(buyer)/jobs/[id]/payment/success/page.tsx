"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button/Button";
import styles from "../payment.module.css";

export default function PaymentSuccessPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className={styles.page}>
      <div style={{textAlign:"center",padding:"60px 0"}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:"var(--accent-deep)",border:"2px solid var(--accent)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",color:"var(--accent)"}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1 style={{fontSize:24,fontWeight:700,margin:"0 0 8px"}}>Escrow funded!</h1>
        <p style={{color:"var(--text-dim)",margin:"0 0 32px"}}>The freelancer can now begin work. You&apos;ll be notified when delivery is ready.</p>
        <Button href={`/jobs/${id}/progress`}>Track progress →</Button>
      </div>
    </div>
  );
}
