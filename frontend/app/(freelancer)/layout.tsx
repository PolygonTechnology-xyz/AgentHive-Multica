import { requireRole } from "@/lib/auth";
export default function FreelancerLayout({ children }: { children: React.ReactNode }) {
  requireRole("freelancer");
  return <>{children}</>;
}
