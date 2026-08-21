import { db } from "@/db/drizzle";
import { store, audit } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { requireSuperAdmin } from "@/server/permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ShieldAlert, ShieldCheck, Activity, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SuperAdminDashboard() {
  const session = await requireSuperAdmin();
  const user = session.currentUser;

  // Database count queries
  const totalStoresResult = await db.select({ value: count() }).from(store);
  const totalStores = totalStoresResult[0]?.value || 0;

  const activeStoresResult = await db.select({ value: count() }).from(store).where(eq(store.status, "ACTIVE"));
  const activeStores = activeStoresResult[0]?.value || 0;

  const inactiveStoresResult = await db.select({ value: count() }).from(store).where(eq(store.status, "INACTIVE"));
  const inactiveStores = inactiveStoresResult[0]?.value || 0;

  const auditLogs = await db.query.audit.findMany({
    orderBy: [desc(audit.createdAt)],
    limit: 10,
  });

  return (
    <div className="min-h-screen space-y-8 bg-zinc-50/50 p-6 text-zinc-950 md:p-10">
      {/* Welcome Banner */}
      <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 p-6 text-white shadow-md md:flex-row md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#3f3f46_1px,transparent_1px),linear-gradient(to_bottom,#3f3f46_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.06] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="relative z-10 flex-1 space-y-4 text-center md:text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/50 bg-zinc-800/80 px-2.5 py-1 font-bold text-[10px] text-zinc-300 uppercase tracking-wider">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              Platform Console
            </div>
            <h1 className="mt-3 font-extrabold text-2xl text-white tracking-tight md:text-3xl">
              Super Admin Overview 👋
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-400 leading-relaxed">
              Monitor operational status, create new medical stores, and view system logs across all pharmacy outlets.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <Link href="/super-admin/stores/new">
              <Button className="flex cursor-pointer items-center gap-1.5 rounded-lg border-transparent bg-white px-4 py-3 font-bold text-xs text-zinc-950 shadow-sm transition-all hover:bg-zinc-100">
                <Plus className="size-3.5 stroke-[3px]" />
                Create New Store
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-zinc-200 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
              Total Stores
            </span>
            <Building2 className="size-4 text-zinc-450" />
          </CardHeader>
          <CardContent>
            <div className="font-extrabold text-3xl">{totalStores}</div>
            <p className="mt-1 text-[10px] text-zinc-450">Registered store locations</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
              Active Stores
            </span>
            <ShieldCheck className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="font-extrabold text-3xl text-emerald-600">{activeStores}</div>
            <p className="mt-1 text-[10px] text-zinc-450">Currently operating</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
              Inactive Stores
            </span>
            <ShieldAlert className="size-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="font-extrabold text-3xl text-red-600">{inactiveStores}</div>
            <p className="mt-1 text-[10px] text-zinc-450">Access restricted</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Trail List */}
      <Card className="border-zinc-200 bg-white shadow-xs">
        <CardHeader className="border-zinc-100 border-b pb-4">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-zinc-500" />
            <CardTitle className="font-extrabold text-base tracking-tight">
              Audit & Activity Trail
            </CardTitle>
          </div>
          <CardDescription>
            System-wide logs of Super Admin store management actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {auditLogs.length === 0 ? (
            <div className="p-12 text-center text-zinc-405">
              <p className="text-sm font-semibold">No activity recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex flex-col justify-between gap-2 px-6 py-4 sm:flex-row sm:items-center">
                  <div className="space-y-1">
                    <span className={`inline-flex items-center rounded px-2 py-0.5 font-bold text-[9px] uppercase tracking-wider ${
                      log.action === "Store Created" ? "bg-blue-50 text-blue-800 border border-blue-200" :
                      log.action === "Store Activated" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                      "bg-red-50 text-red-800 border border-red-200"
                    }`}>
                      {log.action}
                    </span>
                    <p className="font-bold text-sm text-zinc-900">
                      {log.storeName}
                      <span className="ml-2 font-normal text-xs text-zinc-400">(ID: {log.storeId})</span>
                    </p>
                  </div>
                  <div className="flex flex-col text-left sm:text-right">
                    <span className="font-medium text-xs text-zinc-650">Performed by: <span className="font-bold text-zinc-900">{log.performedBy}</span></span>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
