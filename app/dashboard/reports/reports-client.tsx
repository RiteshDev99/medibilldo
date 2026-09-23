"use client";

import {
  BarChart3,
  Briefcase,
  FileText,
  Package,
  ReceiptText,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { InvoiceDetailDialog } from "@/components/reports/invoice-detail-dialog";
import { ReportsHeader } from "@/components/reports/reports-header";
import { ReportsKpiCards } from "@/components/reports/reports-kpi-cards";
import { CustomersTab } from "@/components/reports/tabs/customers-tab";
import { GstTab } from "@/components/reports/tabs/gst-tab";
import { InventoryTab } from "@/components/reports/tabs/inventory-tab";
import { OverviewTab } from "@/components/reports/tabs/overview-tab";
import { ProfitTab } from "@/components/reports/tabs/profit-tab";
import { SalesTab } from "@/components/reports/tabs/sales-tab";
import { StaffTab } from "@/components/reports/tabs/staff-tab";
import { exportReportCSV } from "@/lib/reports-csv";
import {
  type DateRangeOptions,
  type FullReportsData,
  getReportInvoiceDetails,
  getStoreReportsData,
  type ReportPreset,
} from "@/server/reports";

type ActiveTab =
  | "overview"
  | "sales"
  | "gst"
  | "profit"
  | "inventory"
  | "customers"
  | "staff";

interface ReportsClientProps {
  initialData: FullReportsData;
}

export function ReportsClient({ initialData }: ReportsClientProps) {
  const [data, setData] = useState<FullReportsData>(initialData);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [preset, setPreset] = useState<ReportPreset>(
    initialData.timeframe.preset
  );
  const [startDate, setStartDate] = useState<string>(
    initialData.timeframe.startDate.split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    initialData.timeframe.endDate.split("T")[0]
  );
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(
    initialData.timeframe.preset === "custom"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Selected invoice for detail modal
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  );
  const [invoiceDetails, setInvoiceDetails] = useState<any | null>(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);

  // Fetch report data on filter change
  const handleApplyFilter = (
    newPreset: ReportPreset,
    customStart?: string,
    customEnd?: string
  ) => {
    startTransition(async () => {
      const options: DateRangeOptions = {
        preset: newPreset,
        startDate: customStart || startDate,
        endDate: customEnd || endDate,
      };

      const res = await getStoreReportsData(options);
      if (res.success && res.data) {
        setData(res.data);
        toast.success(`Reports updated for ${res.data.timeframe.label}`);
      } else {
        toast.error(res.error || "Failed to update reports");
      }
    });
  };

  const handlePresetSelect = (p: ReportPreset) => {
    setPreset(p);
    if (p === "custom") {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
      handleApplyFilter(p);
    }
  };

  const handleCustomApply = () => {
    if (!(startDate && endDate)) {
      toast.error("Please select both start and end dates.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date cannot be after end date.");
      return;
    }
    handleApplyFilter("custom", startDate, endDate);
  };

  // Open invoice detail modal
  const handleViewInvoice = async (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsLoadingInvoice(true);
    const res = await getReportInvoiceDetails(invoiceId);
    setIsLoadingInvoice(false);
    if (res.success && res.data) {
      setInvoiceDetails(res.data);
    } else {
      toast.error(res.error || "Could not load invoice details.");
      setSelectedInvoiceId(null);
    }
  };

  interface TabItem {
    key: ActiveTab;
    label: string;
    icon: any;
    count?: number;
  }

  const tabs: TabItem[] = [
    { key: "overview", label: "Executive Overview", icon: BarChart3 },
    {
      key: "sales",
      label: "Sales & Invoices",
      icon: ReceiptText,
      count: data.invoices.length,
    },
    {
      key: "gst",
      label: "GST & Tax Filing",
      icon: FileText,
      count: data.gstSlabs.length,
    },
    {
      key: "profit",
      label: "Profit & Margins",
      icon: TrendingUp,
      count: data.productMargins.length,
    },
    {
      key: "inventory",
      label: "Stock & Valuation",
      icon: Package,
      count: data.expiryAlertBatches.length,
    },
    {
      key: "customers",
      label: "Customer Udhar",
      icon: Users,
      count: data.customerLedger.length,
    },
    {
      key: "staff",
      label: "Staff Performance",
      icon: Briefcase,
      count: data.staffPerformance.length,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 md:p-8">
      {/* Screen & Print Header */}
      <ReportsHeader
        data={data}
        endDate={endDate}
        isPending={isPending}
        onCustomApply={handleCustomApply}
        onEndDateChange={setEndDate}
        onExportCSV={() => exportReportCSV(activeTab, data)}
        onPresetSelect={handlePresetSelect}
        onRefresh={() => handleApplyFilter(preset)}
        onStartDateChange={setStartDate}
        preset={preset}
        showCustomPicker={showCustomPicker}
        startDate={startDate}
      />

      {/* KPI Metric Highlights Cards Grid */}
      <ReportsKpiCards summary={data.summary} />

      {/* Navigation Tabs */}
      <div className="scrollbar-none flex items-center gap-1 overflow-x-auto border-zinc-200 border-b pb-px sm:gap-2 print:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 font-bold text-xs transition-colors sm:text-sm ${
                isActive
                  ? "border-black text-zinc-950"
                  : "border-transparent text-zinc-500 hover:text-zinc-900"
              }`}
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as ActiveTab);
                setSearchQuery("");
              }}
            >
              <Icon
                className={`size-4 ${isActive ? "text-zinc-950" : "text-zinc-400"}`}
              />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && tab.count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 font-bold text-[10px] ${
                    isActive
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <OverviewTab data={data} onNavigateTab={setActiveTab} />
        )}

        {activeTab === "sales" && (
          <SalesTab
            invoices={data.invoices}
            onSearchChange={setSearchQuery}
            onViewInvoice={handleViewInvoice}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === "gst" && (
          <GstTab
            data={data}
            onSearchChange={setSearchQuery}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === "profit" && (
          <ProfitTab
            data={data}
            onSearchChange={setSearchQuery}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === "inventory" && <InventoryTab data={data} />}

        {activeTab === "customers" && (
          <CustomersTab
            data={data}
            onSearchChange={setSearchQuery}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === "staff" && <StaffTab data={data} />}
      </div>

      {/* Drilldown Invoice Modal */}
      <InvoiceDetailDialog
        invoiceDetails={invoiceDetails}
        isLoading={isLoadingInvoice}
        isOpen={!!selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
      />
    </div>
  );
}
