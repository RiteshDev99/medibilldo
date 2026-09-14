import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  PackageCheck,
  Percent,
  Pill,
  Plus,
  ReceiptText,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SalesOverviewChart } from "@/components/dashboard/sales-overview-chart";
import { StaffRecentBills } from "@/components/dashboard/staff-recent-bills";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type AdminDashboardData,
  getAdminDashboardData,
  getStaffDashboardData,
  type StaffDashboardData,
} from "@/server/dashboard";
import { getCurrentStore } from "@/server/store";
import { getCurrentUser } from "@/server/users";

function formatRelativeOrTime(date: Date | string | null): string {
  if (!date) {
    return "Recently";
  }
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 1) {
    return "Just now";
  }
  if (diffMins < 60) {
    return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  }
  if (diffHours < 24 && d.getDate() === now.getDate()) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PaymentBadge({ mode }: { mode: string }) {
  if (mode === "UPI") {
    return (
      <span className="rounded bg-zinc-900 px-2 py-0.5 font-bold text-[10px] text-white uppercase">
        UPI
      </span>
    );
  }
  if (mode === "CASH") {
    return (
      <span className="rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-bold text-[10px] text-zinc-800 uppercase">
        Cash
      </span>
    );
  }
  if (mode === "CREDIT") {
    return (
      <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 font-bold text-[10px] text-amber-800 uppercase">
        Credit
      </span>
    );
  }
  return (
    <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-bold text-[10px] text-blue-800 uppercase">
      {mode}
    </span>
  );
}

function NoStoreView({ isAdmin }: { isAdmin: boolean }) {
  return (
    <Card className="border-zinc-200 bg-white shadow-xs">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-900">
          <Building2 className="size-6" />
        </div>
        <h2 className="mt-4 font-extrabold text-lg text-zinc-900">
          No Pharmacy Store Configured
        </h2>
        <p className="mt-1 max-w-md text-xs text-zinc-500 leading-relaxed">
          {isAdmin
            ? "Please set up your pharmacy store profile to begin tracking live sales, inventory, and analytics."
            : "Your account is not currently assigned to an active pharmacy store. Please contact your administrator."}
        </p>
        {isAdmin && (
          <Link className="mt-5" href="/dashboard/settings">
            <Button className="font-bold text-xs">
              Configure Store Profile
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function AdminDashboardView({ data }: { data: AdminDashboardData }) {
  return (
    <div className="fade-in animate-in space-y-8 duration-300">
      {/* Top 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Sales */}
        <Card className="border-zinc-200 bg-white shadow-xs transition-all duration-200 hover:border-zinc-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
              Today&apos;s Sales
            </span>
            <TrendingUp className="size-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="font-extrabold text-2xl">
              ₹{data.todaySales.toLocaleString("en-IN")}
            </div>
            <p className="mt-1 flex items-center gap-1 font-bold text-[10px]">
              {data.salesGrowthPercent >= 0 ? (
                <span className="flex items-center text-emerald-600">
                  <TrendingUp className="mr-0.5 inline size-3" />+
                  {data.salesGrowthPercent}%
                </span>
              ) : (
                <span className="flex items-center text-rose-600">
                  <TrendingDown className="mr-0.5 inline size-3" />
                  {data.salesGrowthPercent}%
                </span>
              )}
              <span className="font-normal text-zinc-400">
                from yesterday (₹{data.yesterdaySales.toLocaleString("en-IN")})
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Today's Bills */}
        <Card className="border-zinc-200 bg-white shadow-xs transition-all duration-200 hover:border-zinc-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
              Today&apos;s Bills
            </span>
            <ReceiptText className="size-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="font-extrabold text-2xl">
              {data.todayBillsCount}
            </div>
            <p className="mt-1 flex items-center gap-1 font-medium text-[10px] text-zinc-500">
              {data.todayBillsCount > 0 ? (
                <span>
                  Average ₹{data.averageBillAmount.toLocaleString("en-IN")} /
                  bill
                </span>
              ) : (
                <span>No invoices created today</span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Today's Profit */}
        <Card className="border-zinc-200 bg-white shadow-xs transition-all duration-200 hover:border-zinc-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
              Today&apos;s Profit
            </span>
            <Percent className="size-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="font-extrabold text-2xl">
              ₹{data.todayProfit.toLocaleString("en-IN")}
            </div>
            <p className="mt-1 flex items-center gap-1 font-bold text-[10px] text-emerald-600">
              {data.todaySales > 0 ? (
                <>
                  <span>{data.profitMarginPercent}%</span>
                  <span className="font-normal text-zinc-400">
                    Gross Margin on COGS
                  </span>
                </>
              ) : (
                <span className="font-normal text-zinc-400">
                  Based on batch purchase rates
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="border-zinc-200 bg-white shadow-xs transition-all duration-200 hover:border-zinc-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
              Total Customers
            </span>
            <Users className="size-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="font-extrabold text-2xl">
              {data.totalCustomers.toLocaleString("en-IN")}
            </div>
            <p className="mt-1 flex items-center gap-1 font-bold text-[10px] text-emerald-600">
              <span>+{data.newCustomersThisWeek} new</span>
              <span className="font-normal text-zinc-400">
                registered this week
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Sales Overview Graph with Period Switcher */}
      <Card className="border-zinc-200 bg-white p-6 shadow-xs">
        <SalesOverviewChart series={data.chartSeries} />
      </Card>

      {/* Low Stock & Expiry Alerts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Real Stock Alerts */}
        <Card className="border-zinc-200 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-zinc-100 border-b pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 font-extrabold text-sm text-zinc-900 tracking-tight">
                <AlertTriangle className="size-4 text-amber-500" />
                Stock Alerts
              </CardTitle>
              <CardDescription>
                Medicines running critically low on inventory.
              </CardDescription>
            </div>
            {data.stockAlerts.length > 0 ? (
              <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 font-bold text-[9px] text-amber-700">
                {data.stockAlerts.length} Action Required
              </span>
            ) : (
              <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-bold text-[9px] text-emerald-700">
                Stock Healthy
              </span>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {data.stockAlerts.length > 0 ? (
              <div className="divide-y divide-zinc-100">
                {data.stockAlerts.map((item) => {
                  const isOutOfStock = item.currentStock <= 0;
                  return (
                    <div
                      className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-zinc-50/50"
                      key={item.id}
                    >
                      <div>
                        <p className="font-semibold text-sm text-zinc-900">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          Category: {item.category} • Reorder Level:{" "}
                          {item.reorderLevel}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`rounded border px-2 py-1 font-bold text-xs ${
                            isOutOfStock
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-amber-200 bg-amber-50 text-amber-800"
                          }`}
                        >
                          {isOutOfStock
                            ? "Out of Stock"
                            : `${item.currentStock} left`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <CheckCircle2 className="size-8 text-emerald-500" />
                <p className="mt-2 font-bold text-xs text-zinc-800">
                  All Stock Levels Healthy
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  No medicines are currently at or below their reorder
                  thresholds.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Real Expiry Alerts */}
        <Card className="border-zinc-200 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-zinc-100 border-b pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 font-extrabold text-sm text-zinc-900 tracking-tight">
                <Clock className="size-4 text-red-500" />
                Expiry Alerts
              </CardTitle>
              <CardDescription>
                Medicines expiring in the next 45 days.
              </CardDescription>
            </div>
            {data.expiryAlerts.length > 0 ? (
              <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 font-bold text-[9px] text-red-700">
                {data.expiryAlerts.length} Critical
              </span>
            ) : (
              <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-bold text-[9px] text-emerald-700">
                No Risks
              </span>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {data.expiryAlerts.length > 0 ? (
              <div className="divide-y divide-zinc-100">
                {data.expiryAlerts.map((batch) => {
                  const isUrgent = batch.isExpired || batch.daysRemaining <= 15;
                  return (
                    <div
                      className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-zinc-50/50"
                      key={batch.id}
                    >
                      <div>
                        <p className="font-semibold text-sm text-zinc-900">
                          {batch.medicineName}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          Batch: {batch.batchNumber} • Stock:{" "}
                          {batch.stockQuantity} units
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 font-bold text-xs ${
                            isUrgent
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {batch.isExpired
                            ? "Expired"
                            : `${batch.daysRemaining} days left`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <PackageCheck className="size-8 text-emerald-500" />
                <p className="mt-2 font-bold text-xs text-zinc-800">
                  No Near-Expiry Batches
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  No active medicine batches expiring in the next 45 days.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Real Recent Sales */}
      <Card className="overflow-hidden border-zinc-200 bg-white shadow-xs">
        <CardHeader className="border-zinc-100 border-b pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-extrabold text-sm text-zinc-900">
                Recent Sales
              </CardTitle>
              <CardDescription>
                Latest customer invoices processed through the checkout queue.
              </CardDescription>
            </div>
            <Link href="/dashboard/billing">
              <span className="flex items-center gap-1 font-bold text-xs text-zinc-950 hover:underline">
                View Billing Terminal <ArrowUpRight className="size-3" />
              </span>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {data.recentSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-650">
                <thead className="border-zinc-100 border-b bg-zinc-50/50 font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Invoice</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Payment</th>
                    <th className="px-6 py-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150">
                  {data.recentSales.map((inv) => (
                    <tr
                      className="transition-colors hover:bg-zinc-50/30"
                      key={inv.id}
                    >
                      <td className="px-6 py-4 font-bold text-zinc-950">
                        #{inv.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900">
                        {inv.customerName || "Walk-in"}
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900">
                        ₹{inv.grandTotal.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        <PaymentBadge mode={inv.paymentMode} />
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        {formatRelativeOrTime(inv.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <ShoppingBag className="size-8 text-zinc-300" />
              <p className="mt-2 font-bold text-sm text-zinc-800">
                No Invoices Generated Yet
              </p>
              <p className="mt-1 max-w-sm text-xs text-zinc-500">
                Invoices recorded at your billing terminal will appear here in
                real time.
              </p>
              <Link className="mt-4" href="/dashboard/billing">
                <Button className="font-bold text-xs">
                  Create First Invoice
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StaffDashboardView({ data }: { data: StaffDashboardData }) {
  const totalReceived =
    data.paymentsToday.cash + data.paymentsToday.upi + data.paymentsToday.card;

  return (
    <div className="fade-in animate-in space-y-8 duration-300">
      {/* 4 Shift Performance KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Shift Bills */}
        <Card className="border-zinc-200 bg-white shadow-xs transition-all duration-200 hover:border-zinc-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
              My Bills Today
            </span>
            <ReceiptText className="size-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="font-extrabold text-2xl">{data.myBillsToday}</div>
            <p className="mt-1 text-[10px] text-zinc-500">
              Invoices generated during current shift
            </p>
          </CardContent>
        </Card>

        {/* Shift Sales */}
        <Card className="border-zinc-200 bg-white shadow-xs transition-all duration-200 hover:border-zinc-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
              My Sales Today
            </span>
            <TrendingUp className="size-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="font-extrabold text-2xl">
              ₹{data.mySalesToday.toLocaleString("en-IN")}
            </div>
            <p className="mt-1 font-semibold text-[10px] text-emerald-600">
              {data.myBillsToday > 0
                ? "Active counter session"
                : "Terminal ready"}
            </p>
          </CardContent>
        </Card>

        {/* Avg Ticket Size */}
        <Card className="border-zinc-200 bg-white shadow-xs transition-all duration-200 hover:border-zinc-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
              Avg. Ticket Value
            </span>
            <Wallet className="size-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="font-extrabold text-2xl">
              ₹{data.averageBillAmount.toLocaleString("en-IN")}
            </div>
            <p className="mt-1 text-[10px] text-zinc-500">
              {data.myBillsToday > 0
                ? "Average per customer bill"
                : "Awaiting first invoice"}
            </p>
          </CardContent>
        </Card>

        {/* Credit / Udhar */}
        <Card className="border-zinc-200 bg-white shadow-xs transition-all duration-200 hover:border-zinc-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
              Credit (Udhar) Billed
            </span>
            <CreditCard className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="font-extrabold text-2xl text-zinc-900">
              ₹{data.paymentsToday.credit.toLocaleString("en-IN")}
            </div>
            <p className="mt-1 text-[10px] text-amber-700">
              Recorded under customer ledger
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Drawer & Shift Payment Mode Breakdown */}
      <Card className="border-zinc-200 bg-white shadow-xs">
        <CardHeader className="border-zinc-100 border-b pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 font-extrabold text-base text-zinc-900 tracking-tight">
                <Banknote className="size-4 text-emerald-600" />
                Shift Payment Reconciliation & Cash Drawer
              </CardTitle>
              <CardDescription>
                Summary of collections by payment method for cash drawer
                balance.
              </CardDescription>
            </div>
            <div className="text-right">
              <span className="font-semibold text-xs text-zinc-500">
                Direct Collections:{" "}
                <span className="font-extrabold text-zinc-900">
                  ₹{totalReceived.toLocaleString("en-IN")}
                </span>
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
              <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                Cash in Drawer
              </span>
              <p className="mt-1 font-extrabold text-xl text-zinc-950">
                ₹{data.paymentsToday.cash.toLocaleString("en-IN")}
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-400">
                Physical currency
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
              <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                UPI Received
              </span>
              <p className="mt-1 font-extrabold text-xl text-zinc-950">
                ₹{data.paymentsToday.upi.toLocaleString("en-IN")}
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-400">
                Digital payments
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
              <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                Card Swiped
              </span>
              <p className="mt-1 font-extrabold text-xl text-zinc-950">
                ₹{data.paymentsToday.card.toLocaleString("en-IN")}
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-400">POS terminals</p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
              <span className="font-bold text-[10px] text-amber-700 uppercase tracking-wider">
                Udhar / Credit
              </span>
              <p className="mt-1 font-extrabold text-amber-900 text-xl">
                ₹{data.paymentsToday.credit.toLocaleString("en-IN")}
              </p>
              <p className="mt-0.5 text-[10px] text-amber-700">
                Account balance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Counter Guidelines: Low Stock & FEFO Expiry Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Low Stock Warning for Counter */}
        <Card className="border-zinc-200 bg-white shadow-xs">
          <CardHeader className="border-zinc-100 border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-extrabold text-sm text-zinc-900">
                <AlertTriangle className="size-4 text-amber-500" />
                Counter Stock Warnings
              </CardTitle>
              <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 font-bold text-[9px] text-amber-800">
                Low Inventory
              </span>
            </div>
            <CardDescription>
              Medicines in short supply — check before confirming customer
              orders.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {data.counterStockAlerts.length > 0 ? (
              <div className="divide-y divide-zinc-100">
                {data.counterStockAlerts.map((item) => (
                  <div
                    className="flex items-center justify-between px-6 py-3 text-xs"
                    key={item.id}
                  >
                    <div>
                      <p className="font-semibold text-zinc-900">{item.name}</p>
                      <p className="text-[10px] text-zinc-400">
                        {item.category}
                      </p>
                    </div>
                    <span
                      className={`rounded px-2 py-0.5 font-bold text-[10px] ${
                        item.currentStock <= 0
                          ? "border border-red-200 bg-red-50 text-red-700"
                          : "border border-amber-200 bg-amber-50 text-amber-800"
                      }`}
                    >
                      {item.currentStock <= 0
                        ? "Out of Stock"
                        : `${item.currentStock} left`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="font-semibold text-xs text-zinc-700">
                  All critical medicines in stock.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* FEFO Expiry Guidance */}
        <Card className="border-zinc-200 bg-white shadow-xs">
          <CardHeader className="border-zinc-100 border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-extrabold text-sm text-zinc-900">
                <Clock className="size-4 text-rose-500" />
                FEFO Dispensing Guidance
              </CardTitle>
              <span className="rounded border border-rose-200 bg-rose-50 px-2 py-0.5 font-bold text-[9px] text-rose-800">
                Dispense First
              </span>
            </div>
            <CardDescription>
              First-Expiry First-Out batches nearing expiration date.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {data.counterExpiryAlerts.length > 0 ? (
              <div className="divide-y divide-zinc-100">
                {data.counterExpiryAlerts.map((batch) => (
                  <div
                    className="flex items-center justify-between px-6 py-3 text-xs"
                    key={batch.id}
                  >
                    <div>
                      <p className="font-semibold text-zinc-900">
                        {batch.medicineName}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        Batch: {batch.batchNumber} • Stock:{" "}
                        {batch.stockQuantity}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 font-bold text-[10px] ${
                        batch.isExpired || batch.daysRemaining <= 15
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {batch.isExpired
                        ? "Expired"
                        : `${batch.daysRemaining} days left`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="font-semibold text-xs text-zinc-700">
                  No near-expiry batches to prioritize.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prominent Action Bar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link className="group" href="/dashboard/billing">
          <div className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-900 bg-zinc-950 p-6 text-white shadow-md transition-all duration-200 hover:bg-zinc-900">
            <div>
              <span className="font-bold text-[10px] text-zinc-400 uppercase tracking-wider">
                Terminal
              </span>
              <h4 className="font-extrabold text-base tracking-tight">
                New Customer Bill
              </h4>
              <p className="mt-0.5 text-xs text-zinc-400">
                Scan barcodes or search medicines
              </p>
            </div>
            <Plus className="size-6 stroke-[2.5] text-white transition-transform group-hover:scale-110" />
          </div>
        </Link>

        <Link className="group" href="/dashboard/medicines">
          <div className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow-xs transition-all duration-200 hover:border-zinc-300">
            <div>
              <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                Inventory
              </span>
              <h4 className="font-extrabold text-base tracking-tight">
                Medicine Lookup
              </h4>
              <p className="mt-0.5 text-xs text-zinc-500">
                Check batch stocks & MRP rates
              </p>
            </div>
            <Pill className="size-5 text-zinc-400 transition-transform group-hover:scale-110" />
          </div>
        </Link>

        <Link className="group" href="/dashboard/customers">
          <div className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow-xs transition-all duration-200 hover:border-zinc-300">
            <div>
              <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                Directory
              </span>
              <h4 className="font-extrabold text-base tracking-tight">
                Customer Accounts
              </h4>
              <p className="mt-0.5 text-xs text-zinc-500">
                View phone numbers & udhar ledger
              </p>
            </div>
            <Users className="size-5 text-zinc-400 transition-transform group-hover:scale-110" />
          </div>
        </Link>
      </div>

      {/* Recent Bills List for Staff with Instant Receipt Modal */}
      <Card className="overflow-hidden border-zinc-200 bg-white shadow-xs">
        <CardHeader className="border-zinc-100 border-b pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-extrabold text-sm text-zinc-900">
                Recent Invoices Processed
              </CardTitle>
              <CardDescription>
                Your latest customer billing transactions. Click Receipt to view
                or reprint.
              </CardDescription>
            </div>
            <Link href="/dashboard/billing">
              <span className="flex items-center gap-1 font-bold text-xs text-zinc-950 hover:underline">
                Open Billing Terminal <ArrowUpRight className="size-3" />
              </span>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <StaffRecentBills bills={data.myRecentBills} />
        </CardContent>
      </Card>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getCurrentUser();
  const user = session.currentUser;

  if (user.role === "SUPER_ADMIN") {
    redirect("/super-admin");
  }

  const isAdmin = user.role === "ADMIN";
  const currentStore = await getCurrentStore();

  const [adminData, staffData] = await Promise.all([
    isAdmin && currentStore ? getAdminDashboardData(currentStore.id) : null,
    !isAdmin && currentStore
      ? getStaffDashboardData(currentStore.id, user.id)
      : null,
  ]);

  return (
    <div className="min-h-screen space-y-8 bg-zinc-50/50 p-6 text-zinc-950 md:p-10">
      {/* Premium Welcome Banner */}
      <div className="group relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 p-6 text-white shadow-md md:flex-row md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#3f3f46_1px,transparent_1px),linear-gradient(to_bottom,#3f3f46_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.06] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="relative z-10 flex-1 space-y-4 text-center md:text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/50 bg-zinc-800/80 px-2.5 py-1 font-bold text-[10px] text-zinc-300 uppercase tracking-wider">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              {currentStore ? currentStore.storeName : "MediBilldo Workspace"}
            </div>
            <h1 className="mt-3 font-extrabold text-2xl text-white tracking-tight md:text-3xl">
              Welcome back, {user.name} 👋
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-400 leading-relaxed">
              {isAdmin
                ? "Your intelligent pharmacy hub. Track daily sales, monitor medicine inventory, and generate digital invoices seamlessly."
                : "Your pharmacy billing station. Issue sales bills, check medicine batch inventory, and manage customer credit."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <Link href="/dashboard/billing">
              <Button className="flex cursor-pointer items-center gap-1.5 rounded-lg border-transparent bg-white px-4 py-3 font-bold text-xs text-zinc-950 shadow-sm transition-all hover:bg-zinc-100">
                <Plus className="size-3.5 stroke-[3px]" />
                New Sale Bill
              </Button>
            </Link>
            <span className="font-medium text-xs text-zinc-400">
              Logged in as:
              <span className="ml-1.5 rounded border border-zinc-700 bg-zinc-850 px-2.5 py-0.5 font-bold text-[10px] text-zinc-200 uppercase">
                {user.role}
              </span>
            </span>
          </div>
        </div>

        <div className="relative flex w-full shrink-0 items-center justify-center px-4 md:w-auto">
          <div className="pointer-events-none absolute size-44 rounded-full bg-zinc-700/20 opacity-80 blur-3xl transition-transform duration-500 group-hover:scale-110" />
          <div className="relative z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)] filter transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03]">
            <Image
              alt="MediBilldo Mascot"
              className="h-25 w-auto object-contain md:h-45"
              height={150}
              priority
              src="/mascot.png"
              width={220}
            />
          </div>
        </div>
      </div>

      {!currentStore && <NoStoreView isAdmin={isAdmin} />}
      {currentStore && isAdmin && adminData && (
        <AdminDashboardView data={adminData} />
      )}
      {currentStore && !isAdmin && staffData && (
        <StaffDashboardView data={staffData} />
      )}
    </div>
  );
}
