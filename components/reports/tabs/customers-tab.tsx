"use client";

import { Search } from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { FullReportsData } from "@/server/reports";

interface CustomersTabProps {
  data: FullReportsData;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

export function CustomersTab({
  data,
  searchQuery,
  onSearchChange,
}: CustomersTabProps) {
  const filteredCustomerLedger = useMemo(() => {
    if (!searchQuery.trim()) return data.customerLedger;
    const q = searchQuery.toLowerCase();
    return data.customerLedger.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))
    );
  }, [data.customerLedger, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-2.5 left-3 size-4 text-zinc-400" />
          <Input
            className="h-9 border-zinc-200 bg-zinc-50/50 pl-9 text-xs"
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search customer name or phone..."
            value={searchQuery}
          />
        </div>
        <div className="font-medium text-xs text-zinc-600">
          Total Outstanding Receivables:{" "}
          <strong className="ml-1 font-extrabold text-rose-700 text-sm">
            {formatCurrency(data.summary.totalCustomerCreditOutstanding)}
          </strong>
        </div>
      </div>

      <Card className="border-zinc-200 bg-white shadow-2xs">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-zinc-200 border-b bg-zinc-50 font-bold text-[10px] text-zinc-600 uppercase tracking-wider">
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Phone Number</th>
                  <th className="px-4 py-3 text-right">
                    Outstanding Udhar (₹)
                  </th>
                  <th className="px-4 py-3 text-right">Period Purchases (₹)</th>
                  <th className="px-4 py-3 text-center">Period Bills</th>
                  <th className="px-4 py-3 text-center">Last Purchase</th>
                  <th className="px-4 py-3 text-center">Credit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredCustomerLedger.length === 0 ? (
                  <tr>
                    <td className="py-10 text-center text-zinc-400" colSpan={7}>
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomerLedger.map((c) => (
                    <tr className="hover:bg-zinc-50" key={c.id}>
                      <td className="px-4 py-3 font-bold text-zinc-900">
                        {c.name}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {c.phone || "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-rose-700">
                        {formatCurrency(c.creditBalance)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-900">
                        {formatCurrency(c.totalPurchasedInPeriod)}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-zinc-700">
                        {c.billsCountInPeriod}
                      </td>
                      <td className="px-4 py-3 text-center text-zinc-500">
                        {c.lastInvoiceDate || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {c.creditBalance > 0 ? (
                          <span className="rounded border border-rose-200 bg-rose-50 px-2 py-0.5 font-bold text-[10px] text-rose-700">
                            DUE
                          </span>
                        ) : (
                          <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-bold text-[10px] text-emerald-700">
                            CLEAR
                          </span>
                        )}
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
