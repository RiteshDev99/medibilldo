import { CreateStoreDialog } from "@/components/create-store-dialog";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { getCurrentStore } from "@/server/store";
import { getCurrentUser } from "@/server/users";

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

  if (user.role !== "SUPER_ADMIN" && currentStore?.status === "INACTIVE") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50/50 p-6 text-zinc-950">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-xs">
          <h1 className="font-extrabold text-2xl text-red-650 tracking-tight">
            Store Inactive
          </h1>
          <p className="mt-4 text-sm text-zinc-500 leading-relaxed">
            This store is currently inactive.
          </p>
          <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
            Please contact the platform administrator to restore access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50/50 md:flex-row w-full max-w-full overflow-x-hidden">
      <DashboardSidebar
        storeName={currentStore?.storeName}
        user={{ name: user.name, email: user.email, role: user.role }}
      />
      <main className="min-h-screen flex-1 min-w-0 w-full md:pl-64 overflow-x-hidden">
        <div className="w-full min-w-0">{children}</div>
      </main>

      {isAdmin && hasNoStore && <CreateStoreDialog isOpen={true} />}
    </div>
  );
}
