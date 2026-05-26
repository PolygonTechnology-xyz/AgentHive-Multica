import { requireRole } from "@/lib/auth";
import { AdminNav } from "@/components/layout/AdminNav/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = requireRole("admin");
  return (
    <>
      <AdminNav email={user.email} />
      <main>{children}</main>
    </>
  );
}
