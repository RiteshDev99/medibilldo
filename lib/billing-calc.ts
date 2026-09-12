/**
 * Pharmacy POS Price & Tax Calculation Utilities
 * Inspired by MARG retail pharmacy billing rules.
 * All calculations avoid floating point discrepancies via deterministic 2-decimal rounding.
 */

export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export interface CalculateItemParams {
  quantity: number; // Number of units or packs entered
  isPack: boolean; // True if selling by pack (e.g. strip/box), False if loose units (tablets)
  conversionFactor: number; // E.g. 10 tablets per strip
  packMrp: number; // MRP per pack
  customRate?: number; // Optional selling rate per pack, defaults to packMrp
  discountPercent?: number; // E.g. 5 for 5% discount
  gstPercent: number; // E.g. 5, 12, 18, 28
  cessPercent?: number; // E.g. 0
}

export interface CalculatedItemResult {
  baseUnitsSold: number; // Exact quantity in base units deducted from batch
  unitPrice: number; // Effective price per base unit
  packRate: number; // Price per full pack
  grossAmount: number; // Before discount
  discountAmount: number; // Discount in currency
  taxableAmount: number; // Net amount after discount
  baseAmount: number; // Tax-exclusive base value
  gstAmount: number; // Total GST
  cgstAmount: number; // Central GST (GST/2)
  sgstAmount: number; // State GST (GST/2)
  cessAmount: number;
  totalAmount: number; // Final line total
}

export function calculateItemTotals(
  params: CalculateItemParams
): CalculatedItemResult {
  const convFactor = Math.max(1, params.conversionFactor || 1);
  const isPack = params.isPack;
  const quantity = Math.max(0, params.quantity);
  const packRate =
    params.customRate && params.customRate > 0
      ? params.customRate
      : params.packMrp;
  const discountPercent = Math.max(
    0,
    Math.min(100, params.discountPercent || 0)
  );
  const gstPercent = Math.max(0, params.gstPercent || 0);
  const cessPercent = Math.max(0, params.cessPercent || 0);

  let baseUnitsSold: number;
  let grossAmount: number;
  let unitPrice: number;

  if (isPack) {
    // Selling full packs (e.g. 2 strips of 10)
    baseUnitsSold = quantity * convFactor;
    grossAmount = round2(packRate * quantity);
    unitPrice = round2(packRate / convFactor);
  } else {
    // Selling loose units (e.g. 3 tablets)
    baseUnitsSold = quantity;
    unitPrice = round2(packRate / convFactor);
    grossAmount = round2(unitPrice * quantity);
  }

  // Calculate discount
  const discountAmount = round2((grossAmount * discountPercent) / 100);
  const taxableAmount = round2(grossAmount - discountAmount);

  // In Indian retail pharmacy, MRP / rate is typically tax-inclusive
  // Taxable Base = Taxable Amount / (1 + (GST% + Cess%) / 100)
  const totalTaxRate = gstPercent + cessPercent;
  let baseAmount: number;
  let totalTax: number;

  if (totalTaxRate > 0) {
    baseAmount = round2(taxableAmount / (1 + totalTaxRate / 100));
    totalTax = round2(taxableAmount - baseAmount);
  } else {
    baseAmount = taxableAmount;
    totalTax = 0;
  }

  let gstAmount = 0;
  let cessAmount = 0;

  if (totalTaxRate > 0) {
    if (cessPercent > 0) {
      cessAmount = round2(baseAmount * (cessPercent / 100));
      gstAmount = round2(totalTax - cessAmount);
    } else {
      gstAmount = totalTax;
    }
  }

  const cgstAmount = round2(gstAmount / 2);
  const sgstAmount = round2(gstAmount - cgstAmount); // Avoid half-cent mismatch
  const totalAmount = taxableAmount;

  return {
    baseUnitsSold,
    unitPrice,
    packRate,
    grossAmount,
    discountAmount,
    taxableAmount,
    baseAmount,
    gstAmount,
    cgstAmount,
    sgstAmount,
    cessAmount,
    totalAmount,
  };
}

export interface CalculatedInvoiceSummary {
  grossTotal: number;
  itemDiscountTotal: number;
  overallDiscountAmount: number;
  totalDiscount: number;
  subtotal: number; // Base taxable value before taxes
  gstTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  cessTotal: number;
  grandTotal: number;
  roundOff: number;
}

export function calculateInvoiceSummary(
  items: CalculatedItemResult[],
  overallDiscountPercent = 0
): CalculatedInvoiceSummary {
  let grossTotal = 0;
  let itemDiscountTotal = 0;
  let taxableSum = 0;
  let baseSum = 0;
  let gstSum = 0;
  let cgstSum = 0;
  let sgstSum = 0;
  let cessSum = 0;

  for (const item of items) {
    grossTotal += item.grossAmount;
    itemDiscountTotal += item.discountAmount;
    taxableSum += item.taxableAmount;
    baseSum += item.baseAmount;
    gstSum += item.gstAmount;
    cgstSum += item.cgstAmount;
    sgstSum += item.sgstAmount;
    cessSum += item.cessAmount;
  }

  grossTotal = round2(grossTotal);
  itemDiscountTotal = round2(itemDiscountTotal);
  taxableSum = round2(taxableSum);
  baseSum = round2(baseSum);
  gstSum = round2(gstSum);
  cgstSum = round2(cgstSum);
  sgstSum = round2(sgstSum);
  cessSum = round2(cessSum);

  const overallDiscountRate = Math.max(
    0,
    Math.min(100, overallDiscountPercent || 0)
  );
  const overallDiscountAmount = round2(
    (taxableSum * overallDiscountRate) / 100
  );
  const totalDiscount = round2(itemDiscountTotal + overallDiscountAmount);

  const unroundedGrandTotal = round2(taxableSum - overallDiscountAmount);
  const roundedGrandTotal = Math.round(unroundedGrandTotal);
  const roundOff = round2(roundedGrandTotal - unroundedGrandTotal);

  return {
    grossTotal,
    itemDiscountTotal,
    overallDiscountAmount,
    totalDiscount,
    subtotal: baseSum,
    gstTotal: gstSum,
    cgstTotal: cgstSum,
    sgstTotal: sgstSum,
    cessTotal: cessSum,
    grandTotal: roundedGrandTotal,
    roundOff,
  };
}
