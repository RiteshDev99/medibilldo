"use client";

import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FullReportsData, ReportPreset } from "@/server/reports";

interface ReportsHeaderProps {
  data: FullReportsData;
  preset: ReportPreset;
  startDate: string;
  endDate: string;
  showCustomPicker: boolean;
  isPending: boolean;
  onPresetSelect: (preset: ReportPreset) => void;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onCustomApply: () => void;
  onRefresh: () => void;
  onExportCSV: () => void;
}

export function ReportsHeader({
  data,
  preset,
  startDate,
  endDate,
  showCustomPicker,
  isPending,
  onPresetSelect,
  onStartDateChange,
  onEndDateChange,
  onCustomApply,
  onRefresh,
  onExportCSV,
}: ReportsHeaderProps) {
  const presets = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "7days", label: "7 Days" },
    { key: "thisMonth", label: "This Month" },
    { key: "lastMonth", label: "Last Month" },
    { key: "thisYear", label: "This Year" },
    { key: "custom", label: "Custom" },
  ] as const;

  return (
    <>
      {/* Printable Report Header (only visible on print) */}
      <div className="mb-6 hidden border-zinc-900 border-b-2 pb-4 print:block">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-black text-2xl text-zinc-950 uppercase tracking-tight">
              {data.storeInfo.storeName}
            </h1>
            <p className="mt-1 text-xs text-zinc-600">
              {data.storeInfo.address}, {data.storeInfo.city},{" "}
              {data.storeInfo.state} - {data.storeInfo.pincode}
            </p>
            <p className="text-xs text-zinc-600">
              Phone: {data.storeInfo.phone}
            </p>
            {data.storeInfo.gstNumber && (
              <p className="font-semibold text-xs text-zinc-700">
                GSTIN: {data.storeInfo.gstNumber} | DL:{" "}
                {data.storeInfo.drugLicenseNumber || "N/A"}
              </p>
            )}
          </div>
          <div className="text-right">
            <span className="inline-block rounded bg-zinc-900 px-2 py-1 font-bold text-[10px] text-white">
              OFFICIAL BUSINESS REPORT
            </span>
            <p className="mt-2 font-bold text-xs text-zinc-900">
              Period: {data.timeframe.label}
            </p>
            <p className="text-[10px] text-zinc-500">
              Generated: {new Date().toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Screen Header & Action Controls */}
      <div className="flex flex-col gap-4 border-zinc-200 border-b pb-6 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
              Pharmacy Analytics
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-semibold text-[10px] text-emerald-700">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live Dynamic Data
            </span>
          </div>
          <h1 className="mt-1 flex items-center gap-2.5 font-black text-2xl text-zinc-950 tracking-tight sm:text-3xl">
            <BarChart3 className="size-7 stroke-[2.2] text-zinc-900" />
            Reports & Logs
          </h1>
          <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm">
            Real-time financial audits, GSTR-1 tax filings, COGS profit margins,
            and inventory valuations for{" "}
            <span className="font-semibold text-zinc-800">
              {data.storeInfo.storeName}
            </span>
            .
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="gap-1.5 border-zinc-200 font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-100"
            disabled={isPending}
            onClick={onRefresh}
            size="sm"
            variant="outline"
          >
            <RefreshCw
              className={`size-3.5 ${isPending ? "animate-spin text-zinc-900" : ""}`}
            />
            <span>Refresh</span>
          </Button>

          <Button
            className="gap-1.5 border-zinc-200 font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-100"
            onClick={onExportCSV}
            size="sm"
            variant="outline"
          >
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            className="gap-1.5 bg-black font-semibold text-white shadow-xs hover:bg-zinc-800"
            onClick={() => window.print()}
            size="sm"
          >
            <Printer className="size-3.5" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* Date Range Selector Bar */}
      <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-2xs sm:p-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-xs text-zinc-600">
            <Calendar className="size-4 text-zinc-500" />
            <span>Reporting Interval:</span>
            <span className="ml-1 rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-bold text-zinc-900">
              {data.timeframe.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-1 text-xs">
            {presets.map((item) => (
              <button
                className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                  preset === item.key
                    ? "border border-zinc-200 bg-white text-zinc-950 shadow-2xs"
                    : "text-zinc-600 hover:text-zinc-950"
                }`}
                key={item.key}
                onClick={() => onPresetSelect(item.key)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {showCustomPicker && (
          <div className="fade-in slide-in-from-top-1 flex animate-in flex-wrap items-center gap-3 border-zinc-100 border-t pt-3 text-xs">
            <div className="flex items-center gap-2">
              <label className="font-semibold text-zinc-600">From:</label>
              <input
                className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                onChange={(e) => onStartDateChange(e.target.value)}
                type="date"
                value={startDate}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-semibold text-zinc-600">To:</label>
              <input
                className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                onChange={(e) => onEndDateChange(e.target.value)}
                type="date"
                value={endDate}
              />
            </div>
            <Button
              className="h-7 bg-zinc-900 font-medium text-white text-xs hover:bg-zinc-800"
              disabled={isPending}
              onClick={onCustomApply}
              size="sm"
            >
              Apply Filter
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
