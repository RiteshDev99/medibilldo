import { toast } from "sonner";
import type { FullReportsData } from "@/server/reports";

export function exportReportCSV(activeTab: string, data: FullReportsData) {
  let filename = `medibilldo-${activeTab}-${new Date().toISOString().split("T")[0]}.csv`;
  let headers: string[] = [];
  let rows: (string | number)[][] = [];

  switch (activeTab) {
    case "overview":
    case "sales": {
      filename = `sales-report-${data.timeframe.preset}.csv`;
      headers = [
        "Invoice Number",
        "Date & Time",
        "Customer Name",
        "Customer Phone",
        "Doctor",
        "Items Count",
        "Subtotal (₹)",
        "Discount (₹)",
        "GST Total (₹)",
        "Cess Total (₹)",
        "Grand Total (₹)",
        "Payment Mode",
        "Payment Status",
        "Cashier",
      ];
      rows = data.invoices.map((inv) => [
        inv.invoiceNumber,
        inv.createdAt,
        inv.customerName,
        inv.customerPhone || "N/A",
        inv.doctorName || "N/A",
        inv.itemsCount,
        inv.subtotal.toFixed(2),
        inv.discount.toFixed(2),
        inv.gstTotal.toFixed(2),
        inv.cessTotal.toFixed(2),
        inv.grandTotal.toFixed(2),
        inv.paymentMode,
        inv.paymentStatus,
        inv.cashierName,
      ]);
      break;
    }
    case "gst": {
      filename = `gst-hsn-tax-report-${data.timeframe.preset}.csv`;
      headers = [
        "HSN Code",
        "Medicines / Products",
        "Quantity Sold",
        "Taxable Amount (₹)",
        "GST Rate (%)",
        "GST Amount (₹)",
        "Cess Amount (₹)",
        "Total Value (₹)",
      ];
      rows = data.hsnSummary.map((h) => [
        h.hsn,
        `"${h.medicineNames.join(", ")}"`,
        h.totalQuantity,
        h.taxableAmount.toFixed(2),
        `${h.gstRate}%`,
        h.gstAmount.toFixed(2),
        h.cessAmount.toFixed(2),
        h.totalAmount.toFixed(2),
      ]);
      break;
    }
    case "profit": {
      filename = `profit-margins-report-${data.timeframe.preset}.csv`;
      headers = [
        "Medicine Name",
        "Category",
        "Units Sold",
        "Revenue (₹)",
        "Total Cost / COGS (₹)",
        "Gross Profit (₹)",
        "Margin (%)",
      ];
      rows = data.productMargins.map((p) => [
        `"${p.medicineName}"`,
        p.category,
        p.totalUnitsSold,
        p.totalRevenue.toFixed(2),
        p.totalCost.toFixed(2),
        p.grossProfit.toFixed(2),
        `${p.marginPercent}%`,
      ]);
      break;
    }
    case "inventory": {
      filename = "inventory-expiry-valuation.csv";
      headers = [
        "Medicine Name",
        "Batch Number",
        "Expiry Date",
        "Days Remaining",
        "Current Stock Units",
        "Purchase Rate (₹)",
        "MRP (₹)",
        "Locked Cost Valuation (₹)",
        "Status",
      ];
      rows = data.expiryAlertBatches.map((b) => [
        `"${b.medicineName}"`,
        b.batchNumber,
        b.expiryDate,
        b.daysRemaining,
        b.stockQuantity,
        b.purchaseRate.toFixed(2),
        b.mrp.toFixed(2),
        b.lockedCostValuation.toFixed(2),
        b.isExpired ? "EXPIRED" : "NEAR EXPIRY",
      ]);
      break;
    }
    case "customers": {
      filename = "customer-udhar-ledger.csv";
      headers = [
        "Customer Name",
        "Phone Number",
        "Outstanding Credit (₹)",
        "Purchases In Period (₹)",
        "Bills In Period",
        "Last Bill Date",
      ];
      rows = data.customerLedger.map((c) => [
        `"${c.name}"`,
        c.phone || "N/A",
        c.creditBalance.toFixed(2),
        c.totalPurchasedInPeriod.toFixed(2),
        c.billsCountInPeriod,
        c.lastInvoiceDate || "N/A",
      ]);
      break;
    }
    case "staff": {
      filename = `staff-sales-performance-${data.timeframe.preset}.csv`;
      headers = [
        "Staff Name",
        "Role",
        "Email",
        "Bills Count",
        "Total Sales (₹)",
        "Cash Sales (₹)",
        "UPI Sales (₹)",
        "Card Sales (₹)",
        "Credit Sales (₹)",
        "Average Bill (₹)",
      ];
      rows = data.staffPerformance.map((s) => [
        `"${s.name}"`,
        s.role,
        s.email,
        s.billsCount,
        s.totalSales.toFixed(2),
        s.cashSales.toFixed(2),
        s.upiSales.toFixed(2),
        s.cardSales.toFixed(2),
        s.creditSales.toFixed(2),
        s.averageBillValue.toFixed(2),
      ]);
      break;
    }
  }

  if (rows.length === 0) {
    toast.info("No records available to export for this view.");
    return;
  }

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success(`Exported ${filename}`);
}
