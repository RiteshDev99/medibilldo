export type ReportPreset =
  | "today"
  | "yesterday"
  | "7days"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "custom";

export interface DateRangeOptions {
  preset: ReportPreset;
  startDate?: string;
  endDate?: string;
}

export interface ReportsSummaryKPIs {
  totalGrossSales: number;
  totalNetSales: number;
  totalBillsCount: number;
  averageBillValue: number;
  totalDiscountGiven: number;
  totalGstCollected: number;
  totalCessCollected: number;
  totalGrossProfit: number;
  profitMarginPercent: number;
  totalUnitsSold: number;
  totalCustomerCreditOutstanding: number;
}

export interface PaymentModeSummary {
  mode: "CASH" | "UPI" | "CARD" | "CREDIT";
  totalAmount: number;
  count: number;
  percentOfSales: number;
}

export interface GstSlabSummary {
  gstRate: number; // e.g. 0, 5, 12, 18, 28
  itemsCount: number;
  unitsSold: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  totalGst: number;
  cessAmount: number;
  totalInvoiceValue: number;
}

export interface HsnSummaryItem {
  hsn: string;
  medicineNames: string[];
  totalQuantity: number;
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  cessAmount: number;
  totalAmount: number;
}

export interface ProductMarginItem {
  medicineId: string | null;
  medicineName: string;
  category: string;
  totalUnitsSold: number;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  marginPercent: number;
}

export interface InventoryValuationMetrics {
  totalMedicinesCount: number;
  totalBatchesCount: number;
  totalStockUnits: number;
  costValuation: number;
  mrpValuation: number;
  potentialProfitValuation: number;
  expiredBatchesCount: number;
  expiredBatchesLossValuation: number;
  expiringBatchesCount: number; // within 60 days
  expiringBatchesCostValuation: number;
  lowStockMedicinesCount: number;
}

export interface ExpiryRiskBatchItem {
  batchId: string;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  daysRemaining: number;
  stockQuantity: number;
  purchaseRate: number;
  mrp: number;
  lockedCostValuation: number;
  isExpired: boolean;
}

export interface CustomerCreditLedgerItem {
  id: string;
  name: string;
  phone: string | null;
  creditBalance: number;
  totalPurchasedInPeriod: number;
  billsCountInPeriod: number;
  lastInvoiceDate: string | null;
}

export interface StaffPerformanceReportItem {
  userId: string;
  name: string;
  role: string;
  email: string;
  billsCount: number;
  totalSales: number;
  cashSales: number;
  upiSales: number;
  cardSales: number;
  creditSales: number;
  averageBillValue: number;
}

export interface SalesTimelinePoint {
  date: string;
  formattedDate: string;
  grossSales: number;
  billsCount: number;
  profit: number;
}

export interface InvoiceReportRow {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string | null;
  doctorName: string | null;
  itemsCount: number;
  subtotal: number;
  discount: number;
  gstTotal: number;
  cessTotal: number;
  grandTotal: number;
  paymentMode: string;
  paymentStatus: string;
  cashierName: string;
}

export interface StockMovementSummary {
  type: string;
  totalQuantity: number;
  movementsCount: number;
}

export interface FullReportsData {
  timeframe: {
    preset: ReportPreset;
    startDate: string;
    endDate: string;
    label: string;
  };
  storeInfo: {
    id: string;
    storeName: string;
    legalName: string | null;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gstNumber: string | null;
    drugLicenseNumber: string | null;
  };
  summary: ReportsSummaryKPIs;
  paymentModes: PaymentModeSummary[];
  gstSlabs: GstSlabSummary[];
  hsnSummary: HsnSummaryItem[];
  productMargins: ProductMarginItem[];
  inventoryValuation: InventoryValuationMetrics;
  expiryAlertBatches: ExpiryRiskBatchItem[];
  customerLedger: CustomerCreditLedgerItem[];
  staffPerformance: StaffPerformanceReportItem[];
  salesTimeline: SalesTimelinePoint[];
  invoices: InvoiceReportRow[];
  stockMovements: StockMovementSummary[];
}
