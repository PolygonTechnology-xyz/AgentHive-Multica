import { requireRole } from "@/lib/auth";
export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  requireRole("buyer");
  return <>{children}</>;
}
