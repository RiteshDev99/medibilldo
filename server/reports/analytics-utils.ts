import type {
  ExpiryRiskBatchItem,
  GstSlabSummary,
  HsnSummaryItem,
  InventoryValuationMetrics,
  ProductMarginItem,
} from "./types";

/**
 * Groups items into statutory GST slabs (0%, 5%, 12%, 18%, 28%) and calculates HSN summary.
 */
export function calculateGstSlabsAndHsn(periodItems: any[]) {
  const standardSlabs = [0, 5, 12, 18, 28];
  const slabGroups = new Map<number, GstSlabSummary>();

  for (const rate of standardSlabs) {
    slabGroups.set(rate, {
      gstRate: rate,
      itemsCount: 0,
      unitsSold: 0,
      taxableAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      totalGst: 0,
      cessAmount: 0,
      totalInvoiceValue: 0,
    });
  }

  const hsnMap = new Map<
    string,
    {
      hsn: string;
      names: Set<string>;
      qty: number;
      taxable: number;
      gstRate: number;
      gst: number;
      cess: number;
      total: number;
    }
  >();

  for (const item of periodItems) {
    const rate = item.gstPercent ?? 0;
    if (!slabGroups.has(rate)) {
      slabGroups.set(rate, {
        gstRate: rate,
        itemsCount: 0,
        unitsSold: 0,
        taxableAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        totalGst: 0,
        cessAmount: 0,
        totalInvoiceValue: 0,
      });
    }
    const slab = slabGroups.get(rate)!;
    slab.itemsCount += 1;
    slab.unitsSold += item.quantity || 1;
    const itemGst = item.gstAmount || 0;
    const itemCess = item.cessAmount || 0;
    const itemTotal = item.total || 0;
    const itemTaxable = Math.max(0, itemTotal - itemGst - itemCess);

    slab.taxableAmount += itemTaxable;
    slab.totalGst += itemGst;
    slab.cgstAmount += itemGst / 2;
    slab.sgstAmount += itemGst / 2;
    slab.cessAmount += itemCess;
    slab.totalInvoiceValue += itemTotal;

    // HSN aggregation
    const key = item.hsn?.trim() || "N/A";
    if (!hsnMap.has(key)) {
      hsnMap.set(key, {
        hsn: key,
        names: new Set(),
        qty: 0,
        taxable: 0,
        gstRate: item.gstPercent || 0,
        gst: 0,
        cess: 0,
        total: 0,
      });
    }
    const entry = hsnMap.get(key)!;
    entry.names.add(item.medicineName);
    entry.qty += item.quantity || 1;
    entry.taxable += itemTaxable;
    entry.gst += itemGst;
    entry.cess += itemCess;
    entry.total += itemTotal;
  }

  const gstSlabs: GstSlabSummary[] = Array.from(slabGroups.values())
    .map((s) => ({
      ...s,
      taxableAmount: Math.round(s.taxableAmount * 100) / 100,
      cgstAmount: Math.round(s.cgstAmount * 100) / 100,
      sgstAmount: Math.round(s.sgstAmount * 100) / 100,
      totalGst: Math.round(s.totalGst * 100) / 100,
      cessAmount: Math.round(s.cessAmount * 100) / 100,
      totalInvoiceValue: Math.round(s.totalInvoiceValue * 100) / 100,
    }))
    .sort((a, b) => a.gstRate - b.gstRate);

  const hsnSummary: HsnSummaryItem[] = Array.from(hsnMap.values())
    .map((e) => ({
      hsn: e.hsn,
      medicineNames: Array.from(e.names).slice(0, 3),
      totalQuantity: e.qty,
      taxableAmount: Math.round(e.taxable * 100) / 100,
      gstRate: e.gstRate,
      gstAmount: Math.round(e.gst * 100) / 100,
      cessAmount: Math.round(e.cess * 100) / 100,
      totalAmount: Math.round(e.total * 100) / 100,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);

  return { gstSlabs, hsnSummary };
}

/**
 * Calculates item-level COGS and medicine-wise margin breakdowns.
 */
export function calculateProductMargins(
  periodItems: any[],
  medMap: Map<string, any>,
  batchMap: Map<string, any>
): ProductMarginItem[] {
  const prodMap = new Map<
    string,
    {
      id: string | null;
      name: string;
      cat: string;
      qty: number;
      rev: number;
      cost: number;
    }
  >();

  for (const item of periodItems) {
    const key = item.medicineId || item.medicineName;
    const med = item.medicineId ? medMap.get(item.medicineId) : undefined;
    const b = item.batchId ? batchMap.get(item.batchId) : undefined;

    if (!prodMap.has(key)) {
      prodMap.set(key, {
        id: item.medicineId,
        name: item.medicineName,
        cat: med?.category || "General",
        qty: 0,
        rev: 0,
        cost: 0,
      });
    }
    const p = prodMap.get(key)!;
    const qty = item.quantity || 1;
    p.qty += qty;
    p.rev += item.total || 0;

    const unitPurchaseRate = b?.purchaseRate ?? med?.pRate ?? med?.cost ?? 0;
    const convFactor = item.conversionFactor || med?.conversionFactor || 1;
    const baseCost = unitPurchaseRate > 0 ? unitPurchaseRate / convFactor : 0;
    p.cost += baseCost * qty;
  }

  return Array.from(prodMap.values())
    .map((p) => {
      const grossProfit = Math.round((p.rev - p.cost) * 100) / 100;
      const marginPercent =
        p.rev > 0 ? Number(((grossProfit / p.rev) * 100).toFixed(1)) : 0;
      return {
        medicineId: p.id,
        medicineName: p.name,
        category: p.cat,
        totalUnitsSold: p.qty,
        totalRevenue: Math.round(p.rev * 100) / 100,
        totalCost: Math.round(p.cost * 100) / 100,
        grossProfit,
        marginPercent,
      };
    })
    .sort((a, b) => b.grossProfit - a.grossProfit);
}

/**
 * Calculates store stock valuations, expiring batches, and low stock counts.
 */
export function calculateInventoryValuations(
  allStoreBatches: any[],
  allStoreMedicines: any[],
  medMap: Map<string, any>
): {
  valuation: InventoryValuationMetrics;
  expiryAlertBatches: ExpiryRiskBatchItem[];
} {
  const now = new Date();
  const sixtyDaysAhead = new Date(now);
  sixtyDaysAhead.setDate(sixtyDaysAhead.getDate() + 60);

  let totalStockUnits = 0;
  let costValuation = 0;
  let mrpValuation = 0;
  let expiredBatchesCount = 0;
  let expiredBatchesLossValuation = 0;
  let expiringBatchesCount = 0;
  let expiringBatchesCostValuation = 0;

  const expiryAlertBatches: ExpiryRiskBatchItem[] = [];
  const medStockMap = new Map<string, number>();

  for (const b of allStoreBatches) {
    const med = medMap.get(b.medicineId);
    const qty = b.stockQuantity || 0;
    const rate = b.purchaseRate ?? med?.pRate ?? med?.cost ?? 0;
    const mrp = b.mrp ?? med?.mrp ?? 0;

    if (qty > 0) {
      totalStockUnits += qty;
      costValuation += qty * rate;
      mrpValuation += qty * mrp;
      medStockMap.set(b.medicineId, (medStockMap.get(b.medicineId) || 0) + qty);

      const expDate = new Date(b.expiryDate);
      const isExpired = expDate <= now;
      const diffMs = expDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (isExpired || expDate <= sixtyDaysAhead) {
        if (isExpired) {
          expiredBatchesCount += 1;
          expiredBatchesLossValuation += qty * rate;
        } else {
          expiringBatchesCount += 1;
          expiringBatchesCostValuation += qty * rate;
        }
        expiryAlertBatches.push({
          batchId: b.id,
          medicineName: med?.name || "Medicine",
          batchNumber: b.batchNumber,
          expiryDate: expDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          daysRemaining,
          stockQuantity: qty,
          purchaseRate: rate,
          mrp,
          lockedCostValuation: Math.round(qty * rate * 100) / 100,
          isExpired,
        });
      }
    }
  }

  expiryAlertBatches.sort((a, b) => a.daysRemaining - b.daysRemaining);

  let lowStockMedicinesCount = 0;
  for (const m of allStoreMedicines) {
    if (m.status === "ACTIVE") {
      const curStock = medStockMap.get(m.id) || 0;
      const threshold = m.reorderLevel ?? m.minimumQuantity ?? 10;
      if (curStock <= threshold) lowStockMedicinesCount += 1;
    }
  }

  costValuation = Math.round(costValuation * 100) / 100;
  mrpValuation = Math.round(mrpValuation * 100) / 100;
  const potentialProfitValuation = Math.max(
    0,
    Math.round((mrpValuation - costValuation) * 100) / 100
  );

  return {
    valuation: {
      totalMedicinesCount: allStoreMedicines.length,
      totalBatchesCount: allStoreBatches.length,
      totalStockUnits,
      costValuation,
      mrpValuation,
      potentialProfitValuation,
      expiredBatchesCount,
      expiredBatchesLossValuation:
        Math.round(expiredBatchesLossValuation * 100) / 100,
      expiringBatchesCount,
      expiringBatchesCostValuation:
        Math.round(expiringBatchesCostValuation * 100) / 100,
      lowStockMedicinesCount,
    },
    expiryAlertBatches,
  };
}
