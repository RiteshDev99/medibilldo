import { redirect } from "next/navigation";
import { AccessDenied } from "@/components/access-denied";
import { Card } from "@/components/ui/card";
import { getStoreReportsData } from "@/server/reports";
import { getCurrentStore } from "@/server/store";
import { getCurrentUser } from "@/server/users";
import { ReportsClient } from "./reports-client";

export default async function ReportsPage() {
  const session = await getCurrentUser();
  const user = session.currentUser;

  if (user.role === "SUPER_ADMIN") {
    redirect("/super-admin");
  }

  if (user.role !== "ADMIN") {
    return <AccessDenied />;
  }

  const currentStore = await getCurrentStore();

  if (!currentStore) {
    return (
      <div className="p-6 text-center md:p-12">
        <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xs">
          <h2 className="font-extrabold text-lg text-zinc-900">
            No Store Profile Configured
          </h2>
          <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
            Your account is not linked to an active pharmacy store. Please
            create or configure your pharmacy store profile to access business
            reports and tax logs.
          </p>
        </div>
      </div>
    );
  }

  // Preload default reports data for 'thisMonth'
  const reportsResult = await getStoreReportsData({ preset: "thisMonth" });

  if (!(reportsResult.success && reportsResult.data)) {
    return (
      <div className="p-6 text-center md:p-12">
        <Card className="mx-auto max-w-md border-rose-200 bg-rose-50/50 p-6">
          <h3 className="font-bold text-rose-800 text-sm">
            Unable to Load Reports
          </h3>
          <p className="mt-1 text-rose-600 text-xs">
            {reportsResult.error ||
              "An unexpected error occurred while loading business reports."}
          </p>
        </Card>
      </div>
    );
  }

  return <ReportsClient initialData={reportsResult.data} />;
}
