"use client";

import { useMemo, useState } from "react";
import type { ChartDataPoint, DashboardChartSeries } from "@/server/dashboard";

type PeriodType = "today" | "sevenDays" | "thisMonth" | "thisYear";

interface SalesOverviewChartProps {
  series: DashboardChartSeries;
}

function getBarColor(isPeak: boolean, hasSales: boolean): string {
  if (isPeak) {
    return "bg-zinc-950 shadow-xs";
  }
  if (hasSales) {
    return "bg-zinc-300 group-hover:bg-zinc-800";
  }
  return "bg-zinc-150 group-hover:bg-zinc-250";
}

function ChartBar({
  item,
  maxAmount,
}: {
  item: ChartDataPoint;
  maxAmount: number;
}) {
  const isPeak = item.amount > 0 && item.amount === maxAmount;
  const hasSales = item.amount > 0;
  const heightPercent =
    maxAmount > 0
      ? Math.max(hasSales ? 8 : 4, (item.amount / maxAmount) * 85)
      : 4;

  const barColor = getBarColor(isPeak, hasSales);

  return (
    <div className="group relative flex h-full flex-1 flex-col items-center justify-end px-1">
      {/* Floating Tooltip */}
      <div className="pointer-events-none absolute -top-12 z-20 flex flex-col items-center opacity-0 transition-all duration-150 group-hover:opacity-100">
        <div className="whitespace-nowrap rounded-md bg-zinc-900 px-2.5 py-1 text-center font-bold text-[10px] text-white shadow-md">
          <p>₹{item.amount.toLocaleString("en-IN")}</p>
          <p className="font-normal text-[9px] text-zinc-400">
            {item.billsCount} {item.billsCount === 1 ? "bill" : "bills"}
            {item.subLabel ? ` • ${item.subLabel}` : ""}
          </p>
        </div>
        <div className="size-1.5 -translate-y-0.5 rotate-45 bg-zinc-900" />
      </div>

      {/* Amount Pill */}
      {hasSales ? (
        <span className="mb-1.5 hidden font-extrabold text-[9px] text-zinc-600 sm:block">
          {item.amount >= 1000
            ? `₹${(item.amount / 1000).toFixed(1)}k`
            : `₹${item.amount}`}
        </span>
      ) : (
        <span className="mb-1.5 hidden text-[9px] text-zinc-300 sm:block">
          ₹0
        </span>
      )}

      {/* Bar Column */}
      <div
        className={`w-3 rounded-t-sm transition-all duration-300 sm:w-5 md:w-7 ${barColor}`}
        style={{ height: `${heightPercent}%` }}
      />

      {/* X-Axis Label */}
      <span
        className={`mt-2 max-w-full select-none truncate text-center text-[11px] transition-colors ${
          isPeak
            ? "font-extrabold text-zinc-950"
            : "font-medium text-zinc-500 group-hover:text-zinc-900"
        }`}
      >
        {item.label}
      </span>
    </div>
  );
}

export function SalesOverviewChart({ series }: SalesOverviewChartProps) {
  const [period, setPeriod] = useState<PeriodType>("sevenDays");

  const currentData = useMemo(() => {
    return series[period] || [];
  }, [series, period]);

  const { maxAmount, totalPeriodSales, totalPeriodBills } = useMemo(() => {
    let max = 0;
    let sumSales = 0;
    let sumBills = 0;
    for (const point of currentData) {
      if (point.amount > max) {
        max = point.amount;
      }
      sumSales += point.amount;
      sumBills += point.billsCount;
    }
    return {
      maxAmount: max,
      totalPeriodSales: sumSales,
      totalPeriodBills: sumBills,
    };
  }, [currentData]);

  const yAxisSteps = useMemo(() => {
    if (maxAmount === 0) {
      return [0, 0, 0, 0];
    }
    const step = maxAmount / 3;
    return [Math.round(maxAmount), Math.round(step * 2), Math.round(step), 0];
  }, [maxAmount]);

  const periodLabels: Record<PeriodType, string> = {
    today: "Today's Hourly Flow",
    sevenDays: "Last 7 Days Trend",
    thisMonth: "This Month's Breakdown",
    thisYear: "Annual Sales (Jan - Dec)",
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col gap-4 border-zinc-100 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base text-zinc-900 tracking-tight">
              Sales Overview
            </h3>
            <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-bold text-[10px] text-zinc-700">
              {periodLabels[period]}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">
            Period Total:{" "}
            <span className="font-bold text-zinc-900">
              ₹{totalPeriodSales.toLocaleString("en-IN")}
            </span>{" "}
            across{" "}
            <span className="font-bold text-zinc-900">{totalPeriodBills}</span>{" "}
            {totalPeriodBills === 1 ? "bill" : "bills"}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 font-medium text-xs">
          {(["today", "sevenDays", "thisMonth", "thisYear"] as const).map(
            (pKey) => {
              const titles = {
                today: "Today",
                sevenDays: "7 Days",
                thisMonth: "This Month",
                thisYear: "This Year",
              };
              const isActive = period === pKey;
              return (
                <button
                  className={`cursor-pointer rounded-md px-3 py-1 font-semibold transition-all ${
                    isActive
                      ? "border border-zinc-200 bg-white text-zinc-950 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                  key={pKey}
                  onClick={() => setPeriod(pKey)}
                  type="button"
                >
                  {titles[pKey]}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative h-64 w-full">
        {/* Y-Axis Grid Lines & Labels */}
        <div className="pointer-events-none absolute inset-0 flex select-none flex-col justify-between pb-8 font-semibold text-[10px] text-zinc-400">
          <div className="flex items-center justify-between border-zinc-100 border-b pb-1">
            <span>₹{yAxisSteps[0].toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center justify-between border-zinc-100 border-b pb-1">
            <span>₹{yAxisSteps[1].toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center justify-between border-zinc-100 border-b pb-1">
            <span>₹{yAxisSteps[2].toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center justify-between border-zinc-100 border-b pb-1">
            <span>₹0</span>
          </div>
        </div>

        {/* Dynamic Bars */}
        <div className="relative z-10 flex h-4/5 w-full items-end justify-around pb-2">
          {currentData.map((item, idx) => (
            <ChartBar
              item={item}
              key={`${item.label}-${idx}`}
              maxAmount={maxAmount}
            />
          ))}
        </div>
      </div>

      {/* Empty State Banner if no sales at all */}
      {totalPeriodSales === 0 && (
        <div className="rounded-lg border border-zinc-200 border-dashed bg-zinc-50/60 p-4 text-center">
          <p className="font-semibold text-xs text-zinc-600">
            No sales recorded for this timeframe.
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-400">
            Invoices issued through the Billing Terminal will appear here
            automatically.
          </p>
        </div>
      )}
    </div>
  );
}
