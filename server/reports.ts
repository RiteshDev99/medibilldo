"use server";

import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/db/drizzle";
import {
  medicineBatch as batchTable,
  customer as customerTable,
  invoiceItem as invoiceItemTable,
  invoice as invoiceTable,
  medicine as medicineTable,
  stockMovement as stockMovementTable,
  store as storeTable,
  user as userTable,
} from "@/db/schema";
import {
  calculateGstSlabsAndHsn,
  calculateInventoryValuations,
  calculateProductMargins,
} from "./reports/analytics-utils";
import { resolveDateRange } from "./reports/date-utils";
import type {
  CustomerCreditLedgerItem,
  DateRangeOptions,
  FullReportsData,
  InvoiceReportRow,
  PaymentModeSummary,
  SalesTimelinePoint,
  StaffPerformanceReportItem,
  StockMovementSummary,
} from "./reports/types";
import { getCurrentUser } from "./users";

export type * from "./reports/types";

/**
 * Retrieves full dynamic report data for the authenticated store admin.
 */
export async function getStoreReportsData(
  options: DateRangeOptions
): Promise<{ success: boolean; data?: FullReportsData; error?: string }> {
  try {
    const session = await getCurrentUser();
    const user = session.currentUser;

    if (user.role !== "ADMIN") {
      return {
        success: false,
        error: "Access denied. Store Admin role required.",
      };
    }

    const storeId = user.storeId;
    if (!storeId) {
      return {
        success: false,
        error: "No pharmacy store assigned to your account.",
      };
    }

    const storeDetails = await db.query.store.findFirst({
      where: eq(storeTable.id, storeId),
    });

    if (!storeDetails) {
      return { success: false, error: "Pharmacy store profile not found." };
    }

    const { start, end, label } = resolveDateRange(options);

    // 1. Fetch Invoices within the date range
    const periodInvoices = await db.query.invoice.findMany({
      where: and(
        eq(invoiceTable.storeId, storeId),
        gte(invoiceTable.createdAt, start),
        lte(invoiceTable.createdAt, end)
      ),
      orderBy: [desc(invoiceTable.createdAt)],
    });

    const invoiceIds = periodInvoices.map((inv) => inv.id);

    // 2. Fetch all Invoice Items
    const periodItems =
      invoiceIds.length > 0
        ? await db.query.invoiceItem.findMany({
            where: inArray(invoiceItemTable.invoiceId, invoiceIds),
          })
        : [];

    // 3. Batch lookup related models
    const batchIdsInPeriod = Array.from(
      new Set(periodItems.map((i) => i.batchId).filter(Boolean) as string[])
    );

    const [
      allStoreMedicines,
      periodBatches,
      allStoreBatches,
      allStoreCustomers,
      allStoreStaff,
    ] = await Promise.all([
      db.query.medicine.findMany({ where: eq(medicineTable.storeId, storeId) }),
      batchIdsInPeriod.length > 0
        ? db.query.medicineBatch.findMany({
            where: inArray(batchTable.id, batchIdsInPeriod),
          })
        : [],
      db.query.medicineBatch.findMany({
        where: eq(batchTable.storeId, storeId),
      }),
      db.query.customer.findMany({ where: eq(customerTable.storeId, storeId) }),
      db.query.user.findMany({ where: eq(userTable.storeId, storeId) }),
    ]);

    const medMap = new Map(allStoreMedicines.map((m) => [m.id, m]));
    const batchMap = new Map(periodBatches.map((b) => [b.id, b]));
    const staffMap = new Map(allStoreStaff.map((s) => [s.id, s]));

    // 4. Summarize Revenue, Profit, COGS, and Taxes
    let totalGrossSales = 0;
    let totalDiscountGiven = 0;
    let totalGstCollected = 0;
    let totalCessCollected = 0;
    let totalSubtotal = 0;
    let totalUnitsSold = 0;
    let totalCOGS = 0;

    const itemsCountPerInvoice = new Map<string, number>();
    for (const item of periodItems) {
      itemsCountPerInvoice.set(
        item.invoiceId,
        (itemsCountPerInvoice.get(item.invoiceId) || 0) + (item.quantity || 1)
      );
      totalUnitsSold += item.quantity || 1;

      const b = item.batchId ? batchMap.get(item.batchId) : undefined;
      const m = item.medicineId ? medMap.get(item.medicineId) : undefined;
      const unitPurchaseRate = b?.purchaseRate ?? m?.pRate ?? m?.cost ?? 0;
      const convFactor = item.conversionFactor || m?.conversionFactor || 1;
      const baseCost = unitPurchaseRate > 0 ? unitPurchaseRate / convFactor : 0;
      totalCOGS += baseCost * (item.quantity || 1);
    }

    const paymentMap: Record<
      "CASH" | "UPI" | "CARD" | "CREDIT",
      { total: number; count: number }
    > = {
      CASH: { total: 0, count: 0 },
      UPI: { total: 0, count: 0 },
      CARD: { total: 0, count: 0 },
      CREDIT: { total: 0, count: 0 },
    };

    for (const inv of periodInvoices) {
      totalGrossSales += inv.grandTotal || 0;
      totalDiscountGiven += inv.discount || 0;
      totalGstCollected += inv.gstTotal || 0;
      totalCessCollected += inv.cessTotal || 0;
      totalSubtotal += inv.subtotal || 0;

      const mode =
        (inv.paymentMode as "CASH" | "UPI" | "CARD" | "CREDIT") || "CASH";
      if (paymentMap[mode]) {
        paymentMap[mode].total += inv.grandTotal || 0;
        paymentMap[mode].count += 1;
      }
    }

    totalGrossSales = Math.round(totalGrossSales * 100) / 100;
    totalDiscountGiven = Math.round(totalDiscountGiven * 100) / 100;
    totalGstCollected = Math.round(totalGstCollected * 100) / 100;
    totalCessCollected = Math.round(totalCessCollected * 100) / 100;
    totalCOGS = Math.round(totalCOGS * 100) / 100;

    const totalNetSales =
      Math.round((totalSubtotal - totalDiscountGiven) * 100) / 100;
    const totalGrossProfit = Math.max(
      0,
      Math.round((totalGrossSales - totalCOGS) * 100) / 100
    );
    const profitMarginPercent =
      totalGrossSales > 0
        ? Number(((totalGrossProfit / totalGrossSales) * 100).toFixed(1))
        : 0;
    const totalBillsCount = periodInvoices.length;
    const averageBillValue =
      totalBillsCount > 0
        ? Math.round((totalGrossSales / totalBillsCount) * 100) / 100
        : 0;

    const totalCustomerCreditOutstanding = allStoreCustomers.reduce(
      (sum, c) => sum + (c.creditBalance > 0 ? c.creditBalance : 0),
      0
    );

    const paymentModes: PaymentModeSummary[] = (
      ["CASH", "UPI", "CARD", "CREDIT"] as const
    ).map((mode) => ({
      mode,
      totalAmount: Math.round(paymentMap[mode].total * 100) / 100,
      count: paymentMap[mode].count,
      percentOfSales:
        totalGrossSales > 0
          ? Number(
              ((paymentMap[mode].total / totalGrossSales) * 100).toFixed(1)
            )
          : 0,
    }));

    // 5. Modular calculations for GST Slabs, HSN, Margins, and Valuations
    const { gstSlabs, hsnSummary } = calculateGstSlabsAndHsn(periodItems);
    const productMargins = calculateProductMargins(
      periodItems,
      medMap,
      batchMap
    );
    const { valuation: inventoryValuation, expiryAlertBatches } =
      calculateInventoryValuations(allStoreBatches, allStoreMedicines, medMap);

    // 6. Customer Ledger
    const custMap = new Map<
      string,
      { total: number; count: number; lastDate: Date | null }
    >();
    for (const inv of periodInvoices) {
      if (inv.customerId) {
        const cur = custMap.get(inv.customerId) || {
          total: 0,
          count: 0,
          lastDate: null,
        };
        cur.total += inv.grandTotal || 0;
        cur.count += 1;
        const invDate = new Date(inv.createdAt);
        if (!cur.lastDate || invDate > cur.lastDate) cur.lastDate = invDate;
        custMap.set(inv.customerId, cur);
      }
    }

    const customerLedger: CustomerCreditLedgerItem[] = allStoreCustomers
      .map((c) => {
        const p = custMap.get(c.id) || { total: 0, count: 0, lastDate: null };
        return {
          id: c.id,
          name: c.name,
          phone: c.phone,
          creditBalance: Math.round(c.creditBalance * 100) / 100,
          totalPurchasedInPeriod: Math.round(p.total * 100) / 100,
          billsCountInPeriod: p.count,
          lastInvoiceDate: p.lastDate
            ? p.lastDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : null,
        };
      })
      .sort(
        (a, b) =>
          b.creditBalance - a.creditBalance ||
          b.totalPurchasedInPeriod - a.totalPurchasedInPeriod
      );

    // 7. Staff Performance
    const staffSalesMap = new Map<
      string,
      {
        count: number;
        total: number;
        cash: number;
        upi: number;
        card: number;
        credit: number;
      }
    >();

    for (const inv of periodInvoices) {
      const id = inv.createdBy;
      if (!staffSalesMap.has(id)) {
        staffSalesMap.set(id, {
          count: 0,
          total: 0,
          cash: 0,
          upi: 0,
          card: 0,
          credit: 0,
        });
      }
      const entry = staffSalesMap.get(id)!;
      entry.count += 1;
      const amt = inv.grandTotal || 0;
      entry.total += amt;
      if (inv.paymentMode === "CASH") entry.cash += amt;
      else if (inv.paymentMode === "UPI") entry.upi += amt;
      else if (inv.paymentMode === "CARD") entry.card += amt;
      else if (inv.paymentMode === "CREDIT") entry.credit += amt;
    }

    const staffPerformance: StaffPerformanceReportItem[] = allStoreStaff
      .map((s) => {
        const p = staffSalesMap.get(s.id) || {
          count: 0,
          total: 0,
          cash: 0,
          upi: 0,
          card: 0,
          credit: 0,
        };
        const totalSales = Math.round(p.total * 100) / 100;
        return {
          userId: s.id,
          name: s.name,
          role: s.role,
          email: s.email,
          billsCount: p.count,
          totalSales,
          cashSales: Math.round(p.cash * 100) / 100,
          upiSales: Math.round(p.upi * 100) / 100,
          cardSales: Math.round(p.card * 100) / 100,
          creditSales: Math.round(p.credit * 100) / 100,
          averageBillValue:
            p.count > 0 ? Math.round((totalSales / p.count) * 100) / 100 : 0,
        };
      })
      .sort((a, b) => b.totalSales - a.totalSales);

    // 8. Timeline Trend
    const timelineMap = new Map<
      string,
      { label: string; gross: number; count: number }
    >();
    const ascInvoices = [...periodInvoices].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    for (const inv of ascInvoices) {
      const d = new Date(inv.createdAt);
      const dayKey = d.toISOString().split("T")[0];
      const labelStr = d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
      if (!timelineMap.has(dayKey))
        timelineMap.set(dayKey, { label: labelStr, gross: 0, count: 0 });
      const pt = timelineMap.get(dayKey)!;
      pt.gross += inv.grandTotal || 0;
      pt.count += 1;
    }

    const salesTimeline: SalesTimelinePoint[] = Array.from(
      timelineMap.entries()
    ).map(([date, v]) => ({
      date,
      formattedDate: v.label,
      grossSales: Math.round(v.gross * 100) / 100,
      billsCount: v.count,
      profit: 0,
    }));

    // 9. Invoices List
    const invoices: InvoiceReportRow[] = periodInvoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      createdAt: new Date(inv.createdAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      customerName: inv.customerName,
      customerPhone: inv.customerPhone,
      doctorName: inv.doctorName,
      itemsCount: itemsCountPerInvoice.get(inv.id) || 1,
      subtotal: inv.subtotal,
      discount: inv.discount,
      gstTotal: inv.gstTotal,
      cessTotal: inv.cessTotal,
      grandTotal: inv.grandTotal,
      paymentMode: inv.paymentMode,
      paymentStatus: inv.paymentStatus,
      cashierName: staffMap.get(inv.createdBy)?.name || "Staff",
    }));

    // 10. Stock Movements in this period
    const movementsInPeriod = await db.query.stockMovement.findMany({
      where: and(
        eq(stockMovementTable.storeId, storeId),
        gte(stockMovementTable.createdAt, start),
        lte(stockMovementTable.createdAt, end)
      ),
    });

    const movMap = new Map<string, { qty: number; count: number }>();
    for (const mov of movementsInPeriod) {
      const type = mov.type || "OTHER";
      if (!movMap.has(type)) movMap.set(type, { qty: 0, count: 0 });
      const entry = movMap.get(type)!;
      entry.qty += Math.abs(mov.quantity);
      entry.count += 1;
    }

    const stockMovements: StockMovementSummary[] = Array.from(
      movMap.entries()
    ).map(([type, v]) => ({
      type,
      totalQuantity: v.qty,
      movementsCount: v.count,
    }));

    return {
      success: true,
      data: {
        timeframe: {
          preset: options.preset,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          label,
        },
        storeInfo: {
          id: storeDetails.id,
          storeName: storeDetails.storeName,
          legalName: storeDetails.legalName,
          phone: storeDetails.phone,
          address: storeDetails.address,
          city: storeDetails.city,
          state: storeDetails.state,
          pincode: storeDetails.pincode,
          gstNumber: storeDetails.gstNumber,
          drugLicenseNumber: storeDetails.drugLicenseNumber,
        },
        summary: {
          totalGrossSales,
          totalNetSales,
          totalBillsCount,
          averageBillValue,
          totalDiscountGiven,
          totalGstCollected,
          totalCessCollected,
          totalGrossProfit,
          profitMarginPercent,
          totalUnitsSold,
          totalCustomerCreditOutstanding:
            Math.round(totalCustomerCreditOutstanding * 100) / 100,
        },
        paymentModes,
        gstSlabs,
        hsnSummary,
        productMargins,
        inventoryValuation,
        expiryAlertBatches,
        customerLedger,
        staffPerformance,
        salesTimeline,
        invoices,
        stockMovements,
      },
    };
  } catch (error) {
    console.error("Error in getStoreReportsData:", error);
    return {
      success: false,
      error: (error as Error).message || "Failed to generate store reports.",
    };
  }
}

/**
 * Retrieves full single invoice details for drill-down receipt modal in the reports view.
 */
export async function getReportInvoiceDetails(invoiceId: string) {
  try {
    const session = await getCurrentUser();
    const user = session.currentUser;

    if (user.role !== "ADMIN" && user.role !== "STAFF") {
      return { success: false, error: "Access denied." };
    }

    const storeId = user.storeId;
    if (!storeId) {
      return { success: false, error: "No store assigned." };
    }

    const inv = await db.query.invoice.findFirst({
      where: and(
        eq(invoiceTable.id, invoiceId),
        eq(invoiceTable.storeId, storeId)
      ),
    });

    if (!inv) {
      return { success: false, error: "Invoice not found." };
    }

    const items = await db.query.invoiceItem.findMany({
      where: eq(invoiceItemTable.invoiceId, inv.id),
    });

    const storeDetails = await db.query.store.findFirst({
      where: eq(storeTable.id, storeId),
    });

    const cashierUser = await db.query.user.findFirst({
      where: eq(userTable.id, inv.createdBy),
    });

    return {
      success: true,
      data: {
        invoice: inv,
        items,
        store: storeDetails,
        cashier: cashierUser?.name || "Staff",
      },
    };
  } catch (error) {
    console.error("Error in getReportInvoiceDetails:", error);
    return { success: false, error: (error as Error).message };
  }
}
