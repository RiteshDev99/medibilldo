import { getCurrentUser } from "@/server/users";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();
  const user = session.currentUser;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-50/50">
      <DashboardSidebar user={{ name: user.name, email: user.email, role: user.role }} />
      <main className="flex-1 md:pl-64 min-h-screen">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
