import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { requireSuperAdmin } from "@/server/permissions";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSuperAdmin();
  const user = session.currentUser;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50/50 md:flex-row">
      <DashboardSidebar
        user={{ name: user.name, email: user.email, role: user.role }}
      />
      <main className="min-h-screen flex-1 md:pl-64">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
