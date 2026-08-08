import Link from "next/link";
import { getCurrentUser } from "@/server/users";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  ReceiptText,
  Users,
  AlertTriangle,
  Clock,
  Plus,
  ArrowUpRight,
  UserCheck,
  Percent,
  Activity,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getCurrentUser();
  const user = session.currentUser;
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="p-6 md:p-10 space-y-8 bg-zinc-50/50 min-h-screen text-zinc-950">
      {/* Welcome header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">MediBilldo Workspace</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-1">
            Welcome back, {user.name} 👋
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Logged in as <span className="font-semibold text-zinc-900 uppercase">{user.role}</span>
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Link href="/dashboard/billing">
            <Button className="bg-black text-white hover:bg-zinc-800 transition-colors font-semibold flex items-center gap-1.5 shadow-sm">
              <Plus className="size-4" />
              New Sale Bill
            </Button>
          </Link>
        </div>
      </div>

      {isAdmin ? (
        // ==========================================
        // ADMIN DASHBOARD
        // ==========================================
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white border-zinc-200 shadow-xs hover:border-zinc-300 transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Today&apos;s Sales</span>
                <TrendingUp className="size-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold">₹24,500</div>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                  <span>+12.5%</span> <span className="text-zinc-400 font-normal">from yesterday</span>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-zinc-200 shadow-xs hover:border-zinc-300 transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Today&apos;s Bills</span>
                <ReceiptText className="size-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold">48</div>
                <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-1 mt-1">
                  <span>Average ₹510 / bill</span>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-zinc-200 shadow-xs hover:border-zinc-300 transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Today&apos;s Profit</span>
                <Percent className="size-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold">₹6,240</div>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                  <span>25.4%</span> <span className="text-zinc-400 font-normal">Net Profit Margin</span>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-zinc-200 shadow-xs hover:border-zinc-300 transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Customers</span>
                <Users className="size-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold">1,240</div>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                  <span>+18 new</span> <span className="text-zinc-400 font-normal">joined this week</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sales Overview Graph and Quick Filters */}
          <Card className="bg-white border-zinc-200 shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-4">
              <div>
                <CardTitle className="text-base font-extrabold tracking-tight">Sales Overview</CardTitle>
                <CardDescription>Visual transaction summary across periods.</CardDescription>
              </div>
              <div className="flex border border-zinc-200 rounded-lg p-0.5 mt-2 sm:mt-0 text-xs font-medium bg-zinc-50">
                <button className="px-3 py-1 bg-white border border-zinc-200 text-black font-semibold rounded-md shadow-xs">
                  Today
                </button>
                <button className="px-3 py-1 text-zinc-500 hover:text-black transition-colors rounded-md">
                  7 Days
                </button>
                <button className="px-3 py-1 text-zinc-500 hover:text-black transition-colors rounded-md">
                  This Month
                </button>
                <button className="px-3 py-1 text-zinc-500 hover:text-black transition-colors rounded-md">
                  This Year
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-64 w-full flex items-end relative">
                {/* SVG Graph */}
                <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-zinc-400 font-medium pointer-events-none pb-8 select-none">
                  <div className="border-b border-zinc-100 w-full pb-1">₹30,000</div>
                  <div className="border-b border-zinc-100 w-full pb-1">₹20,000</div>
                  <div className="border-b border-zinc-100 w-full pb-1">₹10,000</div>
                  <div className="w-full">₹0</div>
                </div>

                {/* Graph Columns / Dots */}
                <div className="w-full h-4/5 flex justify-around items-end relative z-10 pb-2">
                  <div className="flex flex-col items-center gap-2 group cursor-pointer w-12">
                    <div className="text-[10px] font-bold bg-black text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-xs">
                      ₹12.4k
                    </div>
                    <div className="w-2.5 bg-zinc-300 rounded-t-sm group-hover:bg-black transition-colors h-[40%]" />
                    <span className="text-xs font-semibold text-zinc-500 group-hover:text-black">Mon</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 group cursor-pointer w-12">
                    <div className="text-[10px] font-bold bg-black text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-xs">
                      ₹18.2k
                    </div>
                    <div className="w-2.5 bg-zinc-300 rounded-t-sm group-hover:bg-black transition-colors h-[60%]" />
                    <span className="text-xs font-semibold text-zinc-500 group-hover:text-black">Tue</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 group cursor-pointer w-12">
                    <div className="text-[10px] font-bold bg-black text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-xs">
                      ₹15.5k
                    </div>
                    <div className="w-2.5 bg-zinc-300 rounded-t-sm group-hover:bg-black transition-colors h-[50%]" />
                    <span className="text-xs font-semibold text-zinc-500 group-hover:text-black">Wed</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 group cursor-pointer w-12">
                    <div className="text-[10px] font-bold bg-black text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-xs">
                      ₹24.5k
                    </div>
                    <div className="w-2.5 bg-zinc-950 rounded-t-sm h-[80%]" />
                    <span className="text-xs font-bold text-zinc-950">Thu</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 group cursor-pointer w-12">
                    <div className="text-[10px] font-bold bg-black text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-xs">
                      ₹21.0k
                    </div>
                    <div className="w-2.5 bg-zinc-300 rounded-t-sm group-hover:bg-black transition-colors h-[70%]" />
                    <span className="text-xs font-semibold text-zinc-500 group-hover:text-black">Fri</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock & Expiry Alerts Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Stock Alerts */}
            <Card className="bg-white border-zinc-200 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <CardTitle className="text-sm font-extrabold tracking-tight flex items-center gap-2 text-zinc-900">
                    <AlertTriangle className="size-4 text-amber-500" />
                    Stock Alerts
                  </CardTitle>
                  <CardDescription>Medicines running critically low on inventory.</CardDescription>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded">
                  Action Required
                </span>
              </CardHeader>
              <CardContent className="pt-4 p-0">
                <div className="divide-y divide-zinc-100">
                  <div className="px-6 py-3 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Paracetamol 500mg</p>
                      <p className="text-[10px] text-zinc-500">Category: Tablets</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 text-xs font-bold bg-red-50 text-red-700 border border-red-150 rounded">
                        8 left
                      </span>
                    </div>
                  </div>
                  <div className="px-6 py-3 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Azithromycin 500mg</p>
                      <p className="text-[10px] text-zinc-500">Category: Tablets</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 text-xs font-bold bg-red-50 text-red-700 border border-red-150 rounded">
                        3 left
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expiry Alerts */}
            <Card className="bg-white border-zinc-200 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <CardTitle className="text-sm font-extrabold tracking-tight flex items-center gap-2 text-zinc-900">
                    <Clock className="size-4 text-red-500" />
                    Expiry Alerts
                  </CardTitle>
                  <CardDescription>Medicines expiring in the next 45 days.</CardDescription>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-red-50 text-red-700 border border-red-200 rounded">
                  Critical
                </span>
              </CardHeader>
              <CardContent className="pt-4 p-0">
                <div className="divide-y divide-zinc-100">
                  <div className="px-6 py-3 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Dolo 650</p>
                      <p className="text-[10px] text-zinc-500">Batch: AB123</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-150 rounded-full">
                        20 days left
                      </span>
                    </div>
                  </div>
                  <div className="px-6 py-3 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Amoxicillin</p>
                      <p className="text-[10px] text-zinc-500">Batch: XY231</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-150 rounded-full">
                        35 days left
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sales */}
          <Card className="bg-white border-zinc-200 shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-zinc-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-extrabold text-zinc-900">Recent Sales</CardTitle>
                  <CardDescription>Latest orders processed from checkout queue.</CardDescription>
                </div>
                <Link href="/dashboard/billing">
                  <span className="text-xs font-bold text-zinc-950 hover:underline flex items-center gap-1">
                    View Billing Terminal <ArrowUpRight className="size-3" />
                  </span>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-650">
                  <thead className="bg-zinc-50/50 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-100">
                    <tr>
                      <th className="px-6 py-3">Invoice</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150">
                    <tr className="hover:bg-zinc-50/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-zinc-950">#INV0012</td>
                      <td className="px-6 py-4 font-semibold text-zinc-900">Rahul</td>
                      <td className="px-6 py-4 font-semibold text-zinc-900">₹540</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-zinc-900 text-white rounded">
                          UPI
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-50/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-zinc-950">#INV0013</td>
                      <td className="px-6 py-4 font-semibold text-zinc-900">Walk-in</td>
                      <td className="px-6 py-4 font-semibold text-zinc-900">₹320</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-zinc-100 text-zinc-800 rounded border border-zinc-200">
                          Cash
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-50/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-zinc-950">#INV0014</td>
                      <td className="px-6 py-4 font-semibold text-zinc-900">Amit</td>
                      <td className="px-6 py-4 font-semibold text-zinc-900">₹1,240</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-zinc-100 text-zinc-800 rounded border border-zinc-200">
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
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-white border-zinc-200 shadow-xs hover:border-zinc-300 transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">My Bills Today</span>
                <ReceiptText className="size-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold">24</div>
                <p className="text-[10px] text-zinc-450 mt-1">Processed in current shift</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-zinc-200 shadow-xs hover:border-zinc-300 transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">My Sales Today</span>
                <TrendingUp className="size-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold">₹12,450</div>
                <p className="text-[10px] text-emerald-600 font-semibold mt-1">Active billing queue session</p>
              </CardContent>
            </Card>
          </div>

          {/* Prominent Action Area */}
          <Link href="/dashboard/billing">
            <div className="bg-zinc-950 text-white rounded-xl p-8 border border-zinc-900 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:bg-zinc-900 hover:scale-[1.005] active:scale-[0.995] transition-all duration-200 cursor-pointer group">
              <div>
                <h3 className="font-extrabold text-xl mb-1 tracking-tight">Create Customer Invoice</h3>
                <p className="text-zinc-400 text-sm max-w-md">
                  Open the billing terminal to scan barcodes, lookup medicine inventory, and record payments (Cash/UPI/Card) instantly.
                </p>
              </div>
              <Button className="bg-white text-black font-extrabold px-6 py-6 rounded-lg text-sm border-zinc-100 hover:bg-zinc-100 shadow-sm flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                <Plus className="size-5 stroke-[2.5]" />
                <span>NEW BILL</span>
              </Button>
            </div>
          </Link>

          {/* Recent Bills List */}
          <Card className="bg-white border-zinc-200 shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-zinc-100">
              <CardTitle className="text-sm font-extrabold text-zinc-900">Recent Bills Processed</CardTitle>
              <CardDescription>History of invoices generated by your account today.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-100">
                <div className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded bg-zinc-150 text-zinc-900 font-bold text-xs">#0012</span>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">₹450.00</p>
                      <p className="text-[10px] text-zinc-400">Processed via UPI • 12 mins ago</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                    Paid
                  </span>
                </div>

                <div className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded bg-zinc-150 text-zinc-900 font-bold text-xs">#0013</span>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">₹820.00</p>
                      <p className="text-[10px] text-zinc-400">Processed via Cash • 1 hour ago</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                    Paid
                  </span>
                </div>

                <div className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded bg-zinc-150 text-zinc-900 font-bold text-xs">#0014</span>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">₹230.00</p>
                      <p className="text-[10px] text-zinc-400">Processed via Card • 3 hours ago</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
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
