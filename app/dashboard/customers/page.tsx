import { redirect } from "next/navigation";
import { AccessDenied } from "@/components/access-denied";
import { getAllStoreCustomers } from "@/server/billing";
import { getCurrentStore } from "@/server/store";
import { getCurrentUser } from "@/server/users";
import { CustomersClient } from "./customers-client";

export default async function CustomersPage() {
  const session = await getCurrentUser();
  const user = session.currentUser;

  if (user.role === "SUPER_ADMIN") {
    redirect("/super-admin");
  }

  if (user.role !== "ADMIN" && user.role !== "STAFF") {
    return <AccessDenied />;
  }

  const currentStore = await getCurrentStore();
  if (!currentStore) {
    return (
      <div className="p-6 text-center md:p-12">
        <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xs">
          <h2 className="font-extrabold text-lg text-zinc-900">
            No Store Profile Found
          </h2>
          <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
            Your account is not linked to an active pharmacy store.
          </p>
        </div>
      </div>
    );
  }

  const res = await getAllStoreCustomers();
  const customers = res.success && res.customers ? res.customers : [];

  return <CustomersClient initialCustomers={customers} />;
}
