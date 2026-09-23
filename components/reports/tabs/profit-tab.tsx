"use client";

import { Search } from "lucide-react";
import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { FullReportsData } from "@/server/reports";

interface ProfitTabProps {
  data: FullReportsData;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

export function ProfitTab({
  data,
  searchQuery,
  onSearchChange,
}: ProfitTabProps) {
  const filteredProductMargins = useMemo(() => {
    if (!searchQuery.trim()) return data.productMargins;
    const q = searchQuery.toLowerCase();
    return data.productMargins.filter(
      (p) =>
        p.medicineName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [data.productMargins, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-zinc-200 bg-white p-4">
          <span className="font-bold text-[10px] text-zinc-500 uppercase">
            Net Sales Revenue
          </span>
          <p className="mt-1 font-black text-xl text-zinc-950">
            {formatCurrency(data.summary.totalGrossSales)}
          </p>
          <p className="text-[10px] text-zinc-400">Total billing receipts</p>
        </Card>
        <Card className="border-zinc-200 bg-white p-4">
          <span className="font-bold text-[10px] text-zinc-500 uppercase">
            Cost of Goods Sold (COGS)
          </span>
          <p className="mt-1 font-black text-xl text-zinc-700">
            {formatCurrency(
              data.summary.totalGrossSales - data.summary.totalGrossProfit
            )}
          </p>
          <p className="text-[10px] text-zinc-400">
            Based on batch purchase rates
          </p>
        </Card>
        <Card className="border-zinc-200 bg-white p-4">
          <span className="font-bold text-[10px] text-emerald-700 uppercase">
            Gross Margin Earned
          </span>
          <p className="mt-1 font-black text-emerald-700 text-xl">
            {formatCurrency(data.summary.totalGrossProfit)} (
            {data.summary.profitMarginPercent}%)
          </p>
          <p className="text-[10px] text-emerald-600">
            Net gross profit after inventory cost
          </p>
        </Card>
      </div>

      {/* Product Profit Table */}
      <Card className="border-zinc-200 bg-white shadow-2xs">
        <CardHeader className="flex flex-col justify-between gap-3 border-zinc-100 border-b pb-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="font-extrabold text-base text-zinc-900">
              Product-Level Margin Breakdown
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Calculated from actual sold batch cost rates vs invoice selling
              price
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-2 left-2.5 size-3.5 text-zinc-400" />
            <Input
              className="h-8 border-zinc-200 bg-zinc-50/50 pl-8 text-xs"
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search medicine name..."
              value={searchQuery}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-zinc-200 border-b bg-zinc-50 font-bold text-[10px] text-zinc-600 uppercase tracking-wider">
                  <th className="px-4 py-3">Medicine Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-center">Units Sold</th>
                  <th className="px-4 py-3 text-right">Revenue (₹)</th>
                  <th className="px-4 py-3 text-right">Total Cost (₹)</th>
                  <th className="px-4 py-3 text-right">Gross Profit (₹)</th>
                  <th className="px-4 py-3 text-center">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredProductMargins.length === 0 ? (
                  <tr>
                    <td className="py-10 text-center text-zinc-400" colSpan={7}>
                      No product sales found.
                    </td>
                  </tr>
                ) : (
                  filteredProductMargins.map((p, i) => (
                    <tr className="hover:bg-zinc-50" key={p.medicineId || i}>
                      <td className="px-4 py-3 font-bold text-zinc-900">
                        {p.medicineName}
                      </td>
                      <td className="px-4 py-3 text-zinc-500">{p.category}</td>
                      <td className="px-4 py-3 text-center font-semibold text-zinc-900">
                        {p.totalUnitsSold}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-900">
                        {formatCurrency(p.totalRevenue)}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600">
                        {formatCurrency(p.totalCost)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">
                        {formatCurrency(p.grossProfit)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.totalCost === 0 ? (
                          <span
                            className="rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-semibold text-[9px] text-zinc-600"
                            title="Batch purchase rate was not entered"
                          >
                            Cost Not Set
                          </span>
                        ) : (
                          <span
                            className={`rounded border px-2 py-0.5 font-bold text-[10px] ${
                              p.marginPercent >= 20
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : p.marginPercent >= 10
                                  ? "border-amber-200 bg-amber-50 text-amber-800"
                                  : "border-rose-200 bg-rose-50 text-rose-800"
                            }`}
                          >
                            {p.marginPercent}%
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
