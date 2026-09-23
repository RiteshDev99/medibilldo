"use client";

import { Percent, ReceiptText, TrendingUp, Users, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ReportsSummaryKPIs } from "@/server/reports";

interface ReportsKpiCardsProps {
  summary: ReportsSummaryKPIs;
}

export function ReportsKpiCards({ summary }: ReportsKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      {/* Gross Sales */}
      <Card className="border-zinc-200 bg-white shadow-2xs transition-shadow hover:shadow-xs">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="font-bold text-[11px] uppercase tracking-wider">
              Gross Sales
            </span>
            <ReceiptText className="size-4 text-zinc-700" />
          </div>
          <div className="mt-2 font-black text-xl text-zinc-950 tracking-tight sm:text-2xl">
            {formatCurrency(summary.totalGrossSales)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-500">
            <span>
              {summary.totalBillsCount}{" "}
              {summary.totalBillsCount === 1 ? "bill" : "bills"}
            </span>
            <span className="font-medium text-zinc-700">
              Net: {formatCurrency(summary.totalNetSales)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Gross Profit */}
      <Card className="border-zinc-200 bg-white shadow-2xs transition-shadow hover:shadow-xs">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="font-bold text-[11px] uppercase tracking-wider">
              Gross Profit
            </span>
            <TrendingUp className="size-4 text-emerald-600" />
          </div>
          <div className="mt-2 font-black text-emerald-700 text-xl tracking-tight sm:text-2xl">
            {formatCurrency(summary.totalGrossProfit)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Margin</span>
            <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.2 font-bold text-emerald-700">
              {summary.profitMarginPercent}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* GST & Taxes Collected */}
      <Card className="border-zinc-200 bg-white shadow-2xs transition-shadow hover:shadow-xs">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="font-bold text-[11px] uppercase tracking-wider">
              GST Collected
            </span>
            <Percent className="size-4 text-indigo-600" />
          </div>
          <div className="mt-2 font-black text-xl text-zinc-950 tracking-tight sm:text-2xl">
            {formatCurrency(summary.totalGstCollected)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Cess Total</span>
            <span className="font-medium text-zinc-700">
              {formatCurrency(summary.totalCessCollected)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Average Order Value (AOV) */}
      <Card className="border-zinc-200 bg-white shadow-2xs transition-shadow hover:shadow-xs">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="font-bold text-[11px] uppercase tracking-wider">
              Avg Bill Value
            </span>
            <Wallet className="size-4 text-amber-600" />
          </div>
          <div className="mt-2 font-black text-xl text-zinc-950 tracking-tight sm:text-2xl">
            {formatCurrency(summary.averageBillValue)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Units Sold</span>
            <span className="font-semibold text-zinc-700">
              {summary.totalUnitsSold}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Customer Udhar / Outstanding Balance */}
      <Card className="col-span-2 border-zinc-200 bg-white shadow-2xs transition-shadow hover:shadow-xs lg:col-span-1">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="font-bold text-[11px] uppercase tracking-wider">
              Customer Udhar
            </span>
            <Users className="size-4 text-rose-600" />
          </div>
          <div className="mt-2 font-black text-rose-700 text-xl tracking-tight sm:text-2xl">
            {formatCurrency(summary.totalCustomerCreditOutstanding)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Discounts Given</span>
            <span className="font-medium text-zinc-700">
              {formatCurrency(summary.totalDiscountGiven)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
