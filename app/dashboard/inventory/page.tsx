import { getCurrentUser } from "@/server/users";
import { AccessDenied } from "@/components/access-denied";

export default async function InventoryPage() {
  const session = await getCurrentUser();
  const user = session.currentUser;

  if (user.role !== "ADMIN") {
    return <AccessDenied />;
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="border-b border-zinc-200 pb-6">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Warehouse Logs</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-1">Inventory Management</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Track stock levels, low stock alerts, and batch numbers.</p>
      </div>
      <div className="p-12 text-center border border-dashed border-zinc-200 bg-white rounded-xl">
        <p className="text-sm font-semibold text-zinc-800">This module is under active development.</p>
        <p className="text-xs text-zinc-500 mt-1">Inventory tracking with stock count adjustments will be available soon.</p>
      </div>
    </div>
  );
}
