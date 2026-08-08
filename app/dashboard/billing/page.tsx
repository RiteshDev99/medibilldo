import { getCurrentUser } from "@/server/users";

export default async function BillingPage() {
  const session = await getCurrentUser();

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="border-b border-zinc-200 pb-6">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">POS Terminal</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-1">Billing Terminal</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Quick barcode scanning and invoice checkout system.</p>
      </div>
      <div className="p-12 text-center border border-dashed border-zinc-200 bg-white rounded-xl">
        <p className="text-sm font-semibold text-zinc-800">This module is under active development.</p>
        <p className="text-xs text-zinc-500 mt-1">The billing checkout terminal with item selection will be available in the next step.</p>
      </div>
    </div>
  );
}
