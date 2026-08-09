import { getCurrentUser } from "@/server/users";

export default async function CustomersPage() {
  const session = await getCurrentUser();

  return (
    <div className="space-y-6 p-6 md:p-10">
      <div className="border-zinc-200 border-b pb-6">
        <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
          Accounts Directory
        </span>
        <h1 className="mt-1 font-extrabold text-3xl text-zinc-900 tracking-tight">
          Customers
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Manage customer directory, view purchase histories, and invoices.
        </p>
      </div>
      <div className="rounded-xl border border-zinc-200 border-dashed bg-white p-12 text-center">
        <p className="font-semibold text-sm text-zinc-800">
          This module is under active development.
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Customer directories and credit ledger ledgers will be available soon.
        </p>
      </div>
    </div>
  );
}
