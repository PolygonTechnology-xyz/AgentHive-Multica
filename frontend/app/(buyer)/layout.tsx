import { requireRole } from "@/lib/auth";
import { BuyerNav } from "@/components/layout/BuyerNav/BuyerNav";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const user = requireRole("buyer");
  return (
    <>
      <BuyerNav email={user.email} />
      <main>{children}</main>
    </>
  );
}
