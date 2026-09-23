"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
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
  const [filterMode, setFilterMode] = useState<"all" | "due">("all");

  const dueCount = useMemo(() => {
    return data.customerLedger.filter((c) => c.creditBalance > 0).length;
  }, [data.customerLedger]);

  const filteredCustomerLedger = useMemo(() => {
    let list = data.customerLedger;
    if (filterMode === "due") {
      list = list.filter((c) => c.creditBalance > 0);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))
    );
  }, [data.customerLedger, filterMode, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-3 sm:flex-row sm:items-center">
        <div className="flex max-w-xl flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-3 size-4 text-zinc-400" />
            <Input
              className="h-9 border-zinc-200 bg-zinc-50/50 pl-9 text-xs"
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search customer name or phone..."
              value={searchQuery}
            />
            {searchQuery && (
              <button
                className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-zinc-600"
                onClick={() => onSearchChange("")}
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 text-xs">
            <button
              className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                filterMode === "all"
                  ? "border border-zinc-200 bg-white text-zinc-950 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
              onClick={() => setFilterMode("all")}
              type="button"
            >
              All ({data.customerLedger.length})
            </button>
            <button
              className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                filterMode === "due"
                  ? "border border-rose-200 bg-rose-50 text-rose-800 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
              onClick={() => setFilterMode("due")}
              type="button"
            >
              Due Udhar ({dueCount})
            </button>
          </div>
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
                      No customers found matching this filter.
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
