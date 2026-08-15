import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { getCurrentUser } from "@/server/users";
import { getCurrentStore } from "@/server/store";
import { CreateStoreDialog } from "@/components/create-store-dialog";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();
  const user = session.currentUser;
  const currentStore = await getCurrentStore();

  const isAdmin = user.role === "ADMIN";
  const hasNoStore = currentStore === null;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50/50 md:flex-row">
      <DashboardSidebar
        user={{ name: user.name, email: user.email, role: user.role }}
        storeName={currentStore?.storeName}
      />
      <main className="min-h-screen flex-1 md:pl-64">
        <div className="w-full">{children}</div>
      </main>

      {isAdmin && hasNoStore && (
        <CreateStoreDialog isOpen={true} />
      )}
    </div>
  );
}
