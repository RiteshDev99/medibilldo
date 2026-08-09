import {
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Percent,
  Plus,
  ReceiptText,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/server/users";

export default async function DashboardPage() {
  const session = await getCurrentUser();
  const user = session.currentUser;
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="min-h-screen space-y-8 bg-zinc-50/50 p-6 text-zinc-950 md:p-10">
      {/* Premium Welcome Banner */}
      <div className="group relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 p-6 text-white shadow-md md:flex-row md:p-8">
        {/* Decorative Grid Pattern Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#3f3f46_1px,transparent_1px),linear-gradient(to_bottom,#3f3f46_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.06] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* Left column: Text Content & Actions */}
        <div className="relative z-10 flex-1 space-y-4 text-center md:text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/50 bg-zinc-800/80 px-2.5 py-1 font-bold text-[10px] text-zinc-300 uppercase tracking-wider">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              MediBilldo Workspace
            </div>
            <h1 className="mt-3 font-extrabold text-2xl text-white tracking-tight md:text-3xl">
              Welcome back, {user.name} 👋
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-400 leading-relaxed">
              Your intelligent pharmacy hub. Track daily sales, monitor medicine
              inventory, and generate digital invoices seamlessly.
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

        {/* Right column: Mascot Image with Background Radial Glow */}
        <div className="relative flex w-full shrink-0 items-center justify-center px-4 md:w-auto">
          {/* Subtle Radial Glow */}
          <div className="pointer-events-none absolute size-44 rounded-full bg-zinc-700/20 opacity-80 blur-3xl transition-transform duration-500 group-hover:scale-110" />

          <div className="relative z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)] filter transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03]">
            <Image
              alt="MediBilldo Mascot"
              className="h-25  w-auto object-contain md:h-45"
              height={150}
              priority
              src="/mascot.png"
              width={220}
            />
          </div>
        </div>
      </div>

      {isAdmin ? (
        // ==========================================
        // ADMIN DASHBOARD
        // ==========================================
        <div className="fade-in animate-in space-y-8 duration-300">
          {/* Top Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-zinc-200 bg-white shadow-xs transition-all duration-200 hover:border-zinc-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
                  Today&apos;s Sales
                </span>
                <TrendingUp className="size-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="font-extrabold text-2xl">₹24,500</div>
                <p className="mt-1 flex items-center gap-1 font-bold text-[10px] text-emerald-600">
                  <span>+12.5%</span>{" "}
                  <span className="font-normal text-zinc-400">
                    from yesterday
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 bg-white shadow-xs transition-all duration-200 hover:border-zinc-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
                  Today&apos;s Bills
                </span>
                <ReceiptText className="size-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="font-extrabold text-2xl">48</div>
                <p className="mt-1 flex items-center gap-1 font-medium text-[10px] text-zinc-500">
                  <span>Average ₹510 / bill</span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 bg-white shadow-xs transition-all duration-200 hover:border-zinc-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
                  Today&apos;s Profit
                </span>
                <Percent className="size-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="font-extrabold text-2xl">₹6,240</div>
                <p className="mt-1 flex items-center gap-1 font-bold text-[10px] text-emerald-600">
                  <span>25.4%</span>{" "}
                  <span className="font-normal text-zinc-400">
                    Net Profit Margin
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 bg-white shadow-xs transition-all duration-200 hover:border-zinc-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
                  Total Customers
                </span>
                <Users className="size-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="font-extrabold text-2xl">1,240</div>
                <p className="mt-1 flex items-center gap-1 font-bold text-[10px] text-emerald-600">
                  <span>+18 new</span>{" "}
                  <span className="font-normal text-zinc-400">
                    joined this week
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sales Overview Graph and Quick Filters */}
          <Card className="border-zinc-200 bg-white shadow-xs">
            <CardHeader className="flex flex-col border-zinc-100 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="font-extrabold text-base tracking-tight">
                  Sales Overview
                </CardTitle>
                <CardDescription>
                  Visual transaction summary across periods.
                </CardDescription>
              </div>
              <div className="mt-2 flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 font-medium text-xs sm:mt-0">
                <button className="rounded-md border border-zinc-200 bg-white px-3 py-1 font-semibold text-black shadow-xs">
                  Today
                </button>
                <button className="rounded-md px-3 py-1 text-zinc-500 transition-colors hover:text-black">
                  7 Days
                </button>
                <button className="rounded-md px-3 py-1 text-zinc-500 transition-colors hover:text-black">
                  This Month
                </button>
                <button className="rounded-md px-3 py-1 text-zinc-500 transition-colors hover:text-black">
                  This Year
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative flex h-64 w-full items-end">
                {/* SVG Graph */}
                <div className="pointer-events-none absolute inset-0 flex select-none flex-col justify-between pb-8 font-medium text-[10px] text-zinc-400">
                  <div className="w-full border-zinc-100 border-b pb-1">
                    ₹30,000
                  </div>
                  <div className="w-full border-zinc-100 border-b pb-1">
                    ₹20,000
                  </div>
                  <div className="w-full border-zinc-100 border-b pb-1">
                    ₹10,000
                  </div>
                  <div className="w-full">₹0</div>
                </div>

                {/* Graph Columns / Dots */}
                <div className="relative z-10 flex h-4/5 w-full items-end justify-around pb-2">
                  <div className="group flex w-12 cursor-pointer flex-col items-center gap-2">
                    <div className="rounded bg-black px-1.5 py-0.5 font-bold text-[10px] text-white opacity-0 shadow-xs transition-opacity duration-150 group-hover:opacity-100">
                      ₹12.4k
                    </div>
                    <div className="h-[40%] w-2.5 rounded-t-sm bg-zinc-300 transition-colors group-hover:bg-black" />
                    <span className="font-semibold text-xs text-zinc-500 group-hover:text-black">
                      Mon
                    </span>
                  </div>

                  <div className="group flex w-12 cursor-pointer flex-col items-center gap-2">
                    <div className="rounded bg-black px-1.5 py-0.5 font-bold text-[10px] text-white opacity-0 shadow-xs transition-opacity duration-150 group-hover:opacity-100">
                      ₹18.2k
                    </div>
                    <div className="h-[60%] w-2.5 rounded-t-sm bg-zinc-300 transition-colors group-hover:bg-black" />
                    <span className="font-semibold text-xs text-zinc-500 group-hover:text-black">
                      Tue
                    </span>
                  </div>

                  <div className="group flex w-12 cursor-pointer flex-col items-center gap-2">
                    <div className="rounded bg-black px-1.5 py-0.5 font-bold text-[10px] text-white opacity-0 shadow-xs transition-opacity duration-150 group-hover:opacity-100">
                      ₹15.5k
                    </div>
                    <div className="h-[50%] w-2.5 rounded-t-sm bg-zinc-300 transition-colors group-hover:bg-black" />
                    <span className="font-semibold text-xs text-zinc-500 group-hover:text-black">
                      Wed
                    </span>
                  </div>

                  <div className="group flex w-12 cursor-pointer flex-col items-center gap-2">
                    <div className="rounded bg-black px-1.5 py-0.5 font-bold text-[10px] text-white opacity-0 shadow-xs transition-opacity duration-150 group-hover:opacity-100">
                      ₹24.5k
                    </div>
                    <div className="h-[80%] w-2.5 rounded-t-sm bg-zinc-950" />
                    <span className="font-bold text-xs text-zinc-950">Thu</span>
                  </div>

                  <div className="group flex w-12 cursor-pointer flex-col items-center gap-2">
                    <div className="rounded bg-black px-1.5 py-0.5 font-bold text-[10px] text-white opacity-0 shadow-xs transition-opacity duration-150 group-hover:opacity-100">
                      ₹21.0k
                    </div>
                    <div className="h-[70%] w-2.5 rounded-t-sm bg-zinc-300 transition-colors group-hover:bg-black" />
                    <span className="font-semibold text-xs text-zinc-500 group-hover:text-black">
                      Fri
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock & Expiry Alerts Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Stock Alerts */}
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
                <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 font-bold text-[9px] text-amber-700">
                  Action Required
                </span>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <div className="divide-y divide-zinc-100">
                  <div className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-zinc-50/50">
                    <div>
                      <p className="font-semibold text-sm text-zinc-900">
                        Paracetamol 500mg
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        Category: Tablets
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="rounded border border-red-150 bg-red-50 px-2 py-1 font-bold text-red-700 text-xs">
                        8 left
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-zinc-50/50">
                    <div>
                      <p className="font-semibold text-sm text-zinc-900">
                        Azithromycin 500mg
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        Category: Tablets
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="rounded border border-red-150 bg-red-50 px-2 py-1 font-bold text-red-700 text-xs">
                        3 left
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expiry Alerts */}
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
                <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 font-bold text-[9px] text-red-700">
                  Critical
                </span>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <div className="divide-y divide-zinc-100">
                  <div className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-zinc-50/50">
                    <div>
                      <p className="font-semibold text-sm text-zinc-900">
                        Dolo 650
                      </p>
                      <p className="text-[10px] text-zinc-500">Batch: AB123</p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full border border-amber-150 bg-amber-50 px-2.5 py-0.5 font-bold text-amber-700 text-xs">
                        20 days left
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-zinc-50/50">
                    <div>
                      <p className="font-semibold text-sm text-zinc-900">
                        Amoxicillin
                      </p>
                      <p className="text-[10px] text-zinc-500">Batch: XY231</p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full border border-amber-150 bg-amber-50 px-2.5 py-0.5 font-bold text-amber-700 text-xs">
                        35 days left
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sales */}
          <Card className="overflow-hidden border-zinc-200 bg-white shadow-xs">
            <CardHeader className="border-zinc-100 border-b pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-extrabold text-sm text-zinc-900">
                    Recent Sales
                  </CardTitle>
                  <CardDescription>
                    Latest orders processed from checkout queue.
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
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-650">
                  <thead className="border-zinc-100 border-b bg-zinc-50/50 font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Invoice</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150">
                    <tr className="transition-colors hover:bg-zinc-50/20">
                      <td className="px-6 py-4 font-bold text-zinc-950">
                        #INV0012
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900">
                        Rahul
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900">
                        ₹540
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded bg-zinc-900 px-2 py-0.5 font-bold text-[10px] text-white uppercase">
                          UPI
                        </span>
                      </td>
                    </tr>
                    <tr className="transition-colors hover:bg-zinc-50/20">
                      <td className="px-6 py-4 font-bold text-zinc-950">
                        #INV0013
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900">
                        Walk-in
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900">
                        ₹320
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-bold text-[10px] text-zinc-800 uppercase">
                          Cash
                        </span>
                      </td>
                    </tr>
                    <tr className="transition-colors hover:bg-zinc-50/20">
                      <td className="px-6 py-4 font-bold text-zinc-950">
                        #INV0014
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900">
                        Amit
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900">
                        ₹1,240
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-bold text-[10px] text-zinc-800 uppercase">
                          Card
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // ==========================================
        // STAFF DASHBOARD
        // ==========================================
        <div className="fade-in animate-in space-y-6 duration-300">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-zinc-200 bg-white shadow-xs transition-all duration-200 hover:border-zinc-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
                  My Bills Today
                </span>
                <ReceiptText className="size-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="font-extrabold text-3xl">24</div>
                <p className="mt-1 text-[10px] text-zinc-450">
                  Processed in current shift
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 bg-white shadow-xs transition-all duration-200 hover:border-zinc-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
                  My Sales Today
                </span>
                <TrendingUp className="size-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="font-extrabold text-3xl">₹12,450</div>
                <p className="mt-1 font-semibold text-[10px] text-emerald-600">
                  Active billing queue session
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Prominent Action Area */}
          <Link href="/dashboard/billing">
            <div className="group flex cursor-pointer flex-col items-start justify-between gap-6 rounded-xl border border-zinc-900 bg-zinc-950 p-8 text-white shadow-md transition-all duration-200 hover:scale-[1.005] hover:bg-zinc-900 active:scale-[0.995] sm:flex-row sm:items-center">
              <div>
                <h3 className="mb-1 font-extrabold text-xl tracking-tight">
                  Create Customer Invoice
                </h3>
                <p className="max-w-md text-sm text-zinc-400">
                  Open the billing terminal to scan barcodes, lookup medicine
                  inventory, and record payments (Cash/UPI/Card) instantly.
                </p>
              </div>
              <Button className="flex items-center gap-2 rounded-lg border-zinc-100 bg-white px-6 py-6 font-extrabold text-black text-sm shadow-sm transition-transform hover:bg-zinc-100 group-hover:translate-x-1">
                <Plus className="size-5 stroke-[2.5]" />
                <span>NEW BILL</span>
              </Button>
            </div>
          </Link>

          {/* Recent Bills List */}
          <Card className="overflow-hidden border-zinc-200 bg-white shadow-xs">
            <CardHeader className="border-zinc-100 border-b pb-3">
              <CardTitle className="font-extrabold text-sm text-zinc-900">
                Recent Bills Processed
              </CardTitle>
              <CardDescription>
                History of invoices generated by your account today.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-100">
                <div className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-zinc-50/20">
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-zinc-150 p-2 font-bold text-xs text-zinc-900">
                      #0012
                    </span>
                    <div>
                      <p className="font-bold text-sm text-zinc-900">₹450.00</p>
                      <p className="text-[10px] text-zinc-400">
                        Processed via UPI • 12 mins ago
                      </p>
                    </div>
                  </div>
                  <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-bold text-[9px] text-emerald-800">
                    Paid
                  </span>
                </div>

                <div className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-zinc-50/20">
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-zinc-150 p-2 font-bold text-xs text-zinc-900">
                      #0013
                    </span>
                    <div>
                      <p className="font-bold text-sm text-zinc-900">₹820.00</p>
                      <p className="text-[10px] text-zinc-400">
                        Processed via Cash • 1 hour ago
                      </p>
                    </div>
                  </div>
                  <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-bold text-[9px] text-emerald-800">
                    Paid
                  </span>
                </div>

                <div className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-zinc-50/20">
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-zinc-150 p-2 font-bold text-xs text-zinc-900">
                      #0014
                    </span>
                    <div>
                      <p className="font-bold text-sm text-zinc-900">₹230.00</p>
                      <p className="text-[10px] text-zinc-400">
                        Processed via Card • 3 hours ago
                      </p>
                    </div>
                  </div>
                  <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-bold text-[9px] text-emerald-800">
                    Paid
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
