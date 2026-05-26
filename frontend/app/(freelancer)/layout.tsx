import { requireRole } from "@/lib/auth";
import { FreelancerNav } from "@/components/layout/FreelancerNav/FreelancerNav";

export default function FreelancerLayout({ children }: { children: React.ReactNode }) {
  const user = requireRole("freelancer");
  return (
    <>
      <FreelancerNav email={user.email} />
      <main>{children}</main>
    </>
  );
}
