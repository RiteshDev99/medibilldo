import { getCurrentUser } from "@/server/users";
import { AccessDenied } from "@/components/access-denied";

export default async function PurchasesPage() {
  const session = await getCurrentUser();
  const user = session.currentUser;

  if (user.role !== "ADMIN") {
    return <AccessDenied />;
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="border-b border-zinc-200 pb-6">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Procurement</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-1">Purchases</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage medicine stock purchases from suppliers and update inventory.</p>
      </div>
      <div className="p-12 text-center border border-dashed border-zinc-200 bg-white rounded-xl">
        <p className="text-sm font-semibold text-zinc-800">This module is under active development.</p>
        <p className="text-xs text-zinc-500 mt-1">Purchases logging and supplier invoice entries will be available soon.</p>
      </div>
    </div>
  );
}
