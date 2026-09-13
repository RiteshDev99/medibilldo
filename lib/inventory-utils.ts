import type { Medicine, MedicineBatch } from "@/db/schema";

export type InventoryStatus =
  | "EXPIRED"
  | "OUT_OF_STOCK"
  | "EXPIRING_SOON"
  | "LOW_STOCK"
  | "IN_STOCK";

export interface InventoryStatusInfo {
  status: InventoryStatus;
  label: string;
  badgeVariant: "default" | "destructive" | "outline" | "secondary";
  badgeClassName: string;
  totalStock: number;
  unexpiredStock: number;
  expiredStock: number;
  activeBatch: MedicineBatch | null;
  nearestExpiryDate: Date | null;
  daysUntilExpiry: number | null;
  hasExpiredBatches: boolean;
  hasExpiringSoonBatches: boolean;
  hasLowStock: boolean;
  hasOutOfStock: boolean;
  batches: MedicineBatch[];
}

/**
 * Calculates the inventory status for a medicine based on its batches and stock rules.
 *
 * Business Logic Priority:
 * 1. Expired (any batch with stock > 0 past expiry date, or all available stock is expired)
 * 2. Out of Stock (total unexpired stock == 0)
 * 3. Expiring Soon (earliest active batch expires within next 30 days)
 * 4. Low Stock (total unexpired stock <= configured minimum quantity)
 * 5. In Stock (healthy stock levels)
 */
export function calculateInventoryStatus(
  med: Medicine,
  batches: MedicineBatch[] = []
): InventoryStatusInfo {
  const now = new Date();
  // Normalized to start of today for precise day boundary calculations
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Filter valid batches
  const validBatches = batches.filter(
    (b) => b && b.medicineId === med.id && typeof b.stockQuantity === "number"
  );

  // Separate expired and unexpired batches with stock
  const expiredBatchesWithStock = validBatches.filter((b) => {
    if (!b.expiryDate) return false;
    const exp = new Date(b.expiryDate);
    return exp < today && b.stockQuantity > 0;
  });

  const unexpiredBatchesWithStock = validBatches
    .filter((b) => {
      if (!b.expiryDate) return b.stockQuantity > 0;
      const exp = new Date(b.expiryDate);
      return exp >= today && b.stockQuantity > 0;
    })
    .sort((a, b) => {
      const timeA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
      const timeB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
      return timeA - timeB;
    });

  const totalStock = validBatches.reduce((acc, b) => acc + (b.stockQuantity || 0), 0);
  const unexpiredStock = unexpiredBatchesWithStock.reduce(
    (acc, b) => acc + (b.stockQuantity || 0),
    0
  );
  const expiredStock = expiredBatchesWithStock.reduce(
    (acc, b) => acc + (b.stockQuantity || 0),
    0
  );

  // When expired stock is present, prioritize the expired batch for activeBatch
  // so the table date and countdown directly reflect the critical expiry alert
  const activeBatch =
    expiredBatchesWithStock[0] ||
    unexpiredBatchesWithStock[0] ||
    validBatches[0] ||
    null;

  let nearestExpiryDate: Date | null = null;
  let daysUntilExpiry: number | null = null;

  if (activeBatch && activeBatch.expiryDate) {
    nearestExpiryDate = new Date(activeBatch.expiryDate);
    const diffMs = nearestExpiryDate.getTime() - today.getTime();
    daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  const minStock = med.minimumQuantity ?? med.reorderLevel ?? 0;

  const hasExpiredBatches = expiredBatchesWithStock.length > 0;
  const hasOutOfStock = unexpiredStock === 0 && !hasExpiredBatches;
  const hasExpiringSoonBatches =
    daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 30 && unexpiredStock > 0;
  const hasLowStock =
    unexpiredStock > 0 && minStock > 0 && unexpiredStock <= minStock;

  // Evaluation by priority:
  // Expired -> Out of Stock -> Expiring Soon -> Low Stock -> In Stock
  let status: InventoryStatus = "IN_STOCK";
  let label = "In Stock";
  let badgeVariant: InventoryStatusInfo["badgeVariant"] = "outline";
  let badgeClassName = "border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold";

  if (hasExpiredBatches) {
    status = "EXPIRED";
    label = "Expired";
    badgeVariant = "destructive";
    badgeClassName = "border-red-200 bg-red-50 text-red-700 font-bold";
  } else if (unexpiredStock === 0) {
    status = "OUT_OF_STOCK";
    label = "Out of Stock";
    badgeVariant = "secondary";
    badgeClassName = "border-zinc-300 bg-zinc-100 text-zinc-600 font-semibold";
  } else if (hasExpiringSoonBatches) {
    status = "EXPIRING_SOON";
    label = "Expiring Soon";
    badgeVariant = "outline";
    badgeClassName = "border-amber-300 bg-amber-50 text-amber-800 font-bold";
  } else if (hasLowStock) {
    status = "LOW_STOCK";
    label = "Low Stock";
    badgeVariant = "outline";
    badgeClassName = "border-orange-200 bg-orange-50 text-orange-700 font-bold";
  }

  return {
    status,
    label,
    badgeVariant,
    badgeClassName,
    totalStock,
    unexpiredStock,
    expiredStock,
    activeBatch,
    nearestExpiryDate,
    daysUntilExpiry,
    hasExpiredBatches,
    hasExpiringSoonBatches,
    hasLowStock,
    hasOutOfStock,
    batches: validBatches,
  };
}

/**
 * Formats remaining days into an intuitive badge string.
 */
export function formatExpiryCountdown(daysUntilExpiry: number | null): {
  text: string;
  isUrgent: boolean;
  isExpired: boolean;
  className: string;
} {
  if (daysUntilExpiry === null) {
    return {
      text: "No Expiry",
      isUrgent: false,
      isExpired: false,
      className: "text-zinc-400 bg-zinc-50 border-zinc-200",
    };
  }

  if (daysUntilExpiry < 0) {
    const absDays = Math.abs(daysUntilExpiry);
    return {
      text: `Expired ${absDays}d ago`,
      isUrgent: true,
      isExpired: true,
      className: "text-red-700 bg-red-50 border-red-200 font-bold",
    };
  }

  if (daysUntilExpiry === 0) {
    return {
      text: "Expires Today",
      isUrgent: true,
      isExpired: false,
      className: "text-red-700 bg-red-50 border-red-200 font-bold animate-pulse",
    };
  }

  if (daysUntilExpiry <= 7) {
    return {
      text: `${daysUntilExpiry} days left`,
      isUrgent: true,
      isExpired: false,
      className: "text-red-600 bg-red-50 border-red-200 font-bold",
    };
  }

  if (daysUntilExpiry <= 30) {
    return {
      text: `${daysUntilExpiry} days left`,
      isUrgent: true,
      isExpired: false,
      className: "text-amber-800 bg-amber-50 border-amber-200 font-bold",
    };
  }

  if (daysUntilExpiry <= 90) {
    const months = Math.round(daysUntilExpiry / 30);
    return {
      text: `In ~${months} mos`,
      isUrgent: false,
      isExpired: false,
      className: "text-zinc-600 bg-zinc-50 border-zinc-200",
    };
  }

  const months = Math.round(daysUntilExpiry / 30);
  return {
    text: `In ${months} mos`,
    isUrgent: false,
    isExpired: false,
    className: "text-emerald-700 bg-emerald-50/60 border-emerald-200/60 font-medium",
  };
}
