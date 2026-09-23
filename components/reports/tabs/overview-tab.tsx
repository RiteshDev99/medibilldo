"use client";

import { AlertTriangle, Clock, ShieldAlert } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { FullReportsData } from "@/server/reports";

interface OverviewTabProps {
  data: FullReportsData;
  onNavigateTab: (tab: any) => void;
}

export function OverviewTab({ data, onNavigateTab }: OverviewTabProps) {
  const maxTimelineSales = useMemo(() => {
    if (data.salesTimeline.length === 0) return 0;
    return Math.max(...data.salesTimeline.map((p) => p.grossSales), 0);
  }, [data.salesTimeline]);

  return (
    <div className="space-y-6">
      {/* Sales Flow Trend & Payment Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Daily Sales Chart */}
        <Card className="border-zinc-200 bg-white shadow-2xs lg:col-span-2">
          <CardHeader className="border-zinc-100 border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-extrabold text-base text-zinc-900">
                  Sales Timeline Trend
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Revenue progression over the selected timeframe (
                  {data.timeframe.label})
                </CardDescription>
              </div>
              <Badge className="font-bold text-[10px]" variant="outline">
                {data.salesTimeline.length} Active Days
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {data.salesTimeline.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-400">
                No sales recorded in this interval.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex h-56 items-end justify-between gap-1 border-zinc-200 border-b pt-6 pb-2 sm:gap-2">
                  {data.salesTimeline.map((pt, i) => {
                    const heightPct =
                      maxTimelineSales > 0
                        ? Math.max(8, (pt.grossSales / maxTimelineSales) * 100)
                        : 8;
                    const isPeak =
                      pt.grossSales === maxTimelineSales &&
                      maxTimelineSales > 0;
                    return (
                      <div
                        className="group relative flex h-full flex-1 flex-col items-center justify-end"
                        key={pt.date || i}
                      >
                        <div className="pointer-events-none absolute -top-10 z-30 whitespace-nowrap rounded bg-zinc-900 px-2 py-1 text-[10px] text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                          <p className="font-bold">
                            ₹{pt.grossSales.toLocaleString("en-IN")}
                          </p>
                          <p className="text-[9px] text-zinc-400">
                            {pt.billsCount} bills
                          </p>
                        </div>
                        <div
                          className={`w-full max-w-[28px] rounded-t-sm transition-all duration-300 ${
                            isPeak
                              ? "bg-zinc-950"
                              : "bg-zinc-300 hover:bg-zinc-800"
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="mt-2 max-w-[40px] select-none truncate text-[9px] text-zinc-500">
                          {pt.formattedDate}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>
                    Period Total:{" "}
                    <strong className="text-zinc-900">
                      {formatCurrency(data.summary.totalGrossSales)}
                    </strong>
                  </span>
                  <span>
                    Avg Daily:{" "}
                    <strong className="text-zinc-900">
                      {formatCurrency(
                        data.salesTimeline.length > 0
                          ? data.summary.totalGrossSales /
                              data.salesTimeline.length
                          : 0
                      )}
                    </strong>
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Mode Breakdown */}
        <Card className="flex flex-col border-zinc-200 bg-white shadow-2xs">
          <CardHeader className="border-zinc-100 border-b pb-3">
            <CardTitle className="font-extrabold text-base text-zinc-900">
              Payment Method Split
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Collections across payment channels
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between pt-5">
            <div className="space-y-4">
              {data.paymentModes.map((pm) => {
                const colors: Record<string, { bar: string; badge: string }> = {
                  CASH: {
                    bar: "bg-emerald-500",
                    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
                  },
                  UPI: {
                    bar: "bg-zinc-900",
                    badge: "bg-zinc-100 text-zinc-900 border-zinc-300",
                  },
                  CARD: {
                    bar: "bg-blue-600",
                    badge: "bg-blue-50 text-blue-800 border-blue-200",
                  },
                  CREDIT: {
                    bar: "bg-amber-500",
                    badge: "bg-amber-50 text-amber-800 border-amber-200",
                  },
                };
                const clr = colors[pm.mode] || {
                  bar: "bg-zinc-500",
                  badge: "bg-zinc-100 text-zinc-800",
                };

                return (
                  <div className="space-y-1.5" key={pm.mode}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-zinc-800">
                        <span
                          className={`rounded border px-1.5 py-0.5 font-bold text-[10px] ${clr.badge}`}
                        >
                          {pm.mode}
                        </span>
                        <span className="font-normal text-zinc-400">
                          ({pm.count} bills)
                        </span>
                      </span>
                      <span className="font-extrabold text-zinc-900">
                        {formatCurrency(pm.totalAmount)}
                        <span className="ml-1 font-medium text-[11px] text-zinc-500">
                          ({pm.percentOfSales}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${clr.bar}`}
                        style={{ width: `${pm.percentOfSales}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-between border-zinc-100 border-t pt-4 text-[11px] text-zinc-500">
              <span>Total Settled Bills</span>
              <span className="font-bold text-zinc-900">
                {data.summary.totalBillsCount}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Medicines & Inventory Highlights */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-zinc-200 bg-white shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between border-zinc-100 border-b pb-3">
            <div>
              <CardTitle className="font-extrabold text-sm text-zinc-900">
                Top Products by Revenue & Profit
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Top performers in this timeframe
              </CardDescription>
            </div>
            <Button
              className="font-semibold text-xs text-zinc-600"
              onClick={() => onNavigateTab("profit")}
              size="sm"
              variant="ghost"
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {data.productMargins.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                No product sales in this period.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {data.productMargins.slice(0, 5).map((p, i) => (
                  <div
                    className="flex items-center justify-between p-3.5 hover:bg-zinc-50"
                    key={p.medicineId || i}
                  >
                    <div>
                      <p className="font-bold text-xs text-zinc-900">
                        {p.medicineName}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {p.totalUnitsSold} units sold • Category: {p.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-xs text-zinc-900">
                        {formatCurrency(p.totalRevenue)}
                      </p>
                      <p className="font-semibold text-[10px] text-emerald-700">
                        +₹{p.grossProfit.toFixed(0)} ({p.marginPercent}%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between border-zinc-100 border-b pb-3">
            <div>
              <CardTitle className="font-extrabold text-sm text-zinc-900">
                Inventory Valuation Summary
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Total store stock capital status
              </CardDescription>
            </div>
            <Button
              className="font-semibold text-xs text-zinc-600"
              onClick={() => onNavigateTab("inventory")}
              size="sm"
              variant="ghost"
            >
              Details
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                <span className="font-bold text-[10px] text-zinc-500 uppercase">
                  Cost Valuation
                </span>
                <p className="mt-1 font-black text-base text-zinc-900">
                  {formatCurrency(data.inventoryValuation.costValuation)}
                </p>
                <p className="mt-0.5 text-[10px] text-zinc-400">
                  Purchasing cost locked
                </p>
              </div>
              <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                <span className="font-bold text-[10px] text-zinc-500 uppercase">
                  MRP Valuation
                </span>
                <p className="mt-1 font-black text-base text-zinc-900">
                  {formatCurrency(data.inventoryValuation.mrpValuation)}
                </p>
                <p className="mt-0.5 text-[10px] text-zinc-400">
                  Retail market value
                </p>
              </div>
            </div>

            <div className="space-y-2 border-zinc-100 border-t pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-zinc-600">
                  <AlertTriangle className="size-3.5 text-rose-500" />
                  Expired Batches
                </span>
                <span className="font-bold text-rose-700">
                  {data.inventoryValuation.expiredBatchesCount} batches (Loss:{" "}
                  {formatCurrency(
                    data.inventoryValuation.expiredBatchesLossValuation
                  )}
                  )
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-zinc-600">
                  <Clock className="size-3.5 text-amber-500" />
                  Expiring Soon (&lt; 60 Days)
                </span>
                <span className="font-bold text-amber-700">
                  {data.inventoryValuation.expiringBatchesCount} batches (
                  {formatCurrency(
                    data.inventoryValuation.expiringBatchesCostValuation
                  )}
                  )
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-zinc-600">
                  <ShieldAlert className="size-3.5 text-zinc-500" />
                  Low Stock Items (Need Reorder)
                </span>
                <span className="font-bold text-zinc-800">
                  {data.inventoryValuation.lowStockMedicinesCount} medicines
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
