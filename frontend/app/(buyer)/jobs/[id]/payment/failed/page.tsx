"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button/Button";
import styles from "../payment.module.css";

export default function PaymentFailedPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className={styles.page}>
      <div style={{textAlign:"center",padding:"60px 0"}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:"rgba(239,68,68,0.1)",border:"2px solid var(--error)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",color:"var(--error)"}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </div>
        <h1 style={{fontSize:24,fontWeight:700,margin:"0 0 8px"}}>Payment failed</h1>
        <p style={{color:"var(--text-dim)",margin:"0 0 32px"}}>We couldn&apos;t process your payment. Please try again or contact support.</p>
        <Button href={`/jobs/${id}/payment`}>Try again</Button>
      </div>
    </div>
  );
}
