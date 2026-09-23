"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { FullReportsData } from "@/server/reports";

interface StaffTabProps {
  data: FullReportsData;
}

export function StaffTab({ data }: StaffTabProps) {
  return (
    <div className="space-y-4">
      <Card className="border-zinc-200 bg-white shadow-2xs">
        <CardHeader className="border-zinc-100 border-b pb-3">
          <CardTitle className="font-extrabold text-base text-zinc-900">
            Staff Sales Audit & Cash Drawer Breakdown
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Total bills created and payment modes collected by each staff member
            for shift handover
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-zinc-200 border-b bg-zinc-50 font-bold text-[10px] text-zinc-600 uppercase tracking-wider">
                  <th className="px-4 py-3">Staff Member</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-center">Bills Made</th>
                  <th className="px-4 py-3 text-right">Cash Collected (₹)</th>
                  <th className="px-4 py-3 text-right">UPI (₹)</th>
                  <th className="px-4 py-3 text-right">Card (₹)</th>
                  <th className="px-4 py-3 text-right">Credit (₹)</th>
                  <th className="px-4 py-3 text-right">Total Sales (₹)</th>
                  <th className="px-4 py-3 text-right">Avg Bill (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.staffPerformance.length === 0 ? (
                  <tr>
                    <td className="py-10 text-center text-zinc-400" colSpan={9}>
                      No staff records found.
                    </td>
                  </tr>
                ) : (
                  data.staffPerformance.map((s) => (
                    <tr className="hover:bg-zinc-50" key={s.userId}>
                      <td className="px-4 py-3">
                        <p className="font-bold text-zinc-900">{s.name}</p>
                        <p className="text-[10px] text-zinc-400">{s.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-bold text-[9px] text-zinc-800 uppercase">
                          {s.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-zinc-900">
                        {s.billsCount}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-800">
                        {formatCurrency(s.cashSales)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-900">
                        {formatCurrency(s.upiSales)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-blue-800">
                        {formatCurrency(s.cardSales)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-amber-800">
                        {formatCurrency(s.creditSales)}
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-zinc-950">
                        {formatCurrency(s.totalSales)}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600">
                        {formatCurrency(s.averageBillValue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
