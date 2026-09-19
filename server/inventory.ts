"use server";

import { and, desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import {
  audit,
  medicine,
  medicineBatch,
  stockMovement,
  store,
  user as userTable,
  type Medicine,
  type MedicineBatch,
} from "@/db/schema";
import {
  calculateInventoryStatus,
  type InventoryStatusInfo,
} from "@/lib/inventory-utils";
import { getCurrentUser } from "./users";

export type EnrichedBatch = MedicineBatch & {
  medicineName: string;
  genericName: string;
  packing: string;
  category: string;
  conversionFactor: number;
};

export type EnrichedMovement = {
  id: string;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: Date;
  medicineName: string;
  batchNumber: string;
  performedByName: string;
};

export type MedicineWithInventory = Medicine & {
  batches: MedicineBatch[];
  inventory: InventoryStatusInfo;
  totalCostValuation: number;
  totalMrpValuation: number;
};

export interface InventoryStats {
  totalMedicines: number;
  totalBatches: number;
  totalStockUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringSoonCount: number;
  expiredBatchesCount: number;
  totalCostValuation: number;
  totalMrpValuation: number;
}

export interface InventoryDataResponse {
  success: boolean;
  error?: string;
  stats?: InventoryStats;
  medicines?: MedicineWithInventory[];
  batches?: EnrichedBatch[];
  movements?: EnrichedMovement[];
}

async function logAudit(action: string, storeId: string, performedBy: string) {
  try {
    const storeInfo = await db.query.store.findFirst({
      where: eq(store.id, storeId),
    });
    const storeName = storeInfo?.storeName || "Unknown Store";
    await db.insert(audit).values({
      id: crypto.randomUUID(),
      action,
      storeId,
      storeName,
      performedBy,
    });
  } catch (error) {
    console.error("Failed to log audit:", error);
  }
}

/**
 * Retrieves comprehensive inventory state including medicines, batches, stock movements, and summary statistics.
 */
export async function getInventoryData(): Promise<InventoryDataResponse> {
  try {
    const session = await getCurrentUser();
    const currentUser = session.currentUser;

    if (!currentUser.storeId) {
      return { success: false, error: "No store associated with this user." };
    }

    const storeId = currentUser.storeId;

    // 1. Fetch medicines for this store
    const storeMedicines = await db.query.medicine.findMany({
      where: eq(medicine.storeId, storeId),
      orderBy: [desc(medicine.createdAt)],
    });

    // 2. Fetch all batches for this store
    const storeBatches = await db.query.medicineBatch.findMany({
      where: eq(medicineBatch.storeId, storeId),
      orderBy: [medicineBatch.expiryDate],
    });

    // 3. Map batches by medicine ID
    const batchesByMedId = new Map<string, MedicineBatch[]>();
    for (const batch of storeBatches) {
      const list = batchesByMedId.get(batch.medicineId) || [];
      list.push(batch);
      batchesByMedId.set(batch.medicineId, list);
    }

    const medMap = new Map<string, Medicine>(
      storeMedicines.map((m) => [m.id, m])
    );

    // 4. Enrich batches with medicine metadata
    const enrichedBatches: EnrichedBatch[] = storeBatches.map((b) => {
      const med = medMap.get(b.medicineId);
      return {
        ...b,
        medicineName: med?.name || "Unknown Medicine",
        genericName: med?.genericName || "",
        packing: med?.packing || "1's",
        category: med?.category || "General",
        conversionFactor: med?.conversionFactor || 1,
      };
    });

    // 5. Calculate per-medicine inventory status and valuations
    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let expiringSoonCount = 0;
    let expiredBatchesCount = 0;
    let totalCostValuation = 0;
    let totalMrpValuation = 0;

    const medicinesWithInventory: MedicineWithInventory[] = storeMedicines.map(
      (med) => {
        const medBatches = batchesByMedId.get(med.id) || [];
        const inventory = calculateInventoryStatus(med, medBatches);

        let medCostVal = 0;
        let medMrpVal = 0;

        for (const b of medBatches) {
          const qty = Math.max(0, b.stockQuantity || 0);
          const rate = b.purchaseRate ?? med.pRate ?? med.cost ?? 0;
          const mrp = b.mrp ?? med.mrp ?? 0;
          medCostVal += qty * rate;
          medMrpVal += qty * mrp;
        }

        totalStockUnits += inventory.totalStock;
        totalCostValuation += medCostVal;
        totalMrpValuation += medMrpVal;

        if (inventory.status === "LOW_STOCK") lowStockCount++;
        else if (inventory.status === "OUT_OF_STOCK") outOfStockCount++;
        else if (inventory.status === "EXPIRING_SOON") expiringSoonCount++;

        return {
          ...med,
          batches: medBatches,
          inventory,
          totalCostValuation: Math.round(medCostVal * 100) / 100,
          totalMrpValuation: Math.round(medMrpVal * 100) / 100,
        };
      }
    );

    // Count expired batches across all batches
    const now = new Date();
    for (const b of storeBatches) {
      if (b.stockQuantity > 0 && new Date(b.expiryDate) < now) {
        expiredBatchesCount++;
      }
    }

    // 6. Fetch recent stock movement logs
    const movements = await db.query.stockMovement.findMany({
      where: eq(stockMovement.storeId, storeId),
      orderBy: [desc(stockMovement.createdAt)],
      limit: 150,
    });

    // Fetch users for movement logs performedByName
    const userIds = Array.from(
      new Set(movements.map((m) => m.createdBy).filter(Boolean) as string[])
    );
    const users =
      userIds.length > 0
        ? await db.query.user.findMany({
            where: inArray(userTable.id, userIds),
          })
        : [];
    const userMap = new Map(users.map((u) => [u.id, u.name]));
    const batchMap = new Map(storeBatches.map((b) => [b.id, b]));

    const enrichedMovements: EnrichedMovement[] = movements.map((m) => {
      const med = medMap.get(m.medicineId);
      const batch = batchMap.get(m.batchId);
      const userName = m.createdBy
        ? userMap.get(m.createdBy) || "Staff"
        : "System";

      return {
        id: m.id,
        type: m.type,
        quantity: m.quantity,
        previousStock: m.previousStock,
        newStock: m.newStock,
        referenceType: m.referenceType,
        referenceId: m.referenceId,
        createdAt: m.createdAt,
        medicineName: med?.name || "Unknown Medicine",
        batchNumber: batch?.batchNumber || "N/A",
        performedByName: userName,
      };
    });

    const stats: InventoryStats = {
      totalMedicines: storeMedicines.length,
      totalBatches: storeBatches.length,
      totalStockUnits,
      lowStockCount,
      outOfStockCount,
      expiringSoonCount,
      expiredBatchesCount,
      totalCostValuation: Math.round(totalCostValuation * 100) / 100,
      totalMrpValuation: Math.round(totalMrpValuation * 100) / 100,
    };

    return {
      success: true,
      stats,
      medicines: medicinesWithInventory,
      batches: enrichedBatches,
      movements: enrichedMovements,
    };
  } catch (error) {
    console.error("Failed to get inventory data:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Adjusts stock for a specific medicine batch (count adjustment, damage, write-off, return, etc.)
 */
export async function adjustBatchStock(input: {
  batchId: string;
  type: "ADJUSTMENT" | "DAMAGE" | "EXPIRY" | "RETURN" | "PURCHASE";
  quantityChange: number; // positive to add stock, negative to reduce
  notes?: string;
}) {
  try {
    const session = await getCurrentUser();
    const currentUser = session.currentUser;

    if (!currentUser.storeId) {
      return { success: false, error: "No store associated with this user." };
    }

    const { batchId, type, quantityChange, notes } = input;

    if (!batchId) {
      return { success: false, error: "Batch ID is required." };
    }

    if (quantityChange === 0) {
      return { success: false, error: "Quantity change cannot be 0." };
    }

    const targetBatch = await db.query.medicineBatch.findFirst({
      where: and(
        eq(medicineBatch.id, batchId),
        eq(medicineBatch.storeId, currentUser.storeId)
      ),
    });

    if (!targetBatch) {
      return { success: false, error: "Batch not found in your store." };
    }

    const previousStock = targetBatch.stockQuantity;
    const newStock = previousStock + quantityChange;

    if (newStock < 0) {
      return {
        success: false,
        error: `Cannot reduce stock below 0. Current available stock is ${previousStock} units.`,
      };
    }

    // Update batch stock and record movement in an atomic transaction batch
    const q1 = db
      .update(medicineBatch)
      .set({
        stockQuantity: newStock,
        updatedAt: new Date(),
      })
      .where(eq(medicineBatch.id, batchId));

    const q2 = db.insert(stockMovement).values({
      id: crypto.randomUUID(),
      storeId: currentUser.storeId,
      medicineId: targetBatch.medicineId,
      batchId: targetBatch.id,
      type,
      quantity: quantityChange,
      previousStock,
      newStock,
      referenceType: "MANUAL",
      referenceId: notes ? notes.trim() : null,
      createdBy: currentUser.id,
      createdAt: new Date(),
    });

    await db.batch([q1, q2]);

    await logAudit(
      `STOCK_ADJUSTMENT_${type}_${quantityChange > 0 ? "+" : ""}${quantityChange}`,
      currentUser.storeId,
      currentUser.name
    );

    try {
      revalidatePath("/dashboard/inventory");
      revalidatePath("/dashboard/medicines");
      revalidatePath("/dashboard/billing");
      revalidatePath("/dashboard");
    } catch (e) {
      // safe fallback
    }

    return {
      success: true,
      previousStock,
      newStock,
    };
  } catch (error) {
    console.error("Failed to adjust stock:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Updates batch properties (batch number, expiry, manufacturing date, purchase rate, mrp)
 */
export async function updateBatchDetails(input: {
  batchId: string;
  batchNumber: string;
  expiryDate: string;
  manufacturingDate?: string | null;
  purchaseRate?: number | null;
  mrp: number;
}) {
  try {
    const session = await getCurrentUser();
    const currentUser = session.currentUser;

    if (currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Access denied. Only Admins can edit batch details.",
      };
    }

    if (!currentUser.storeId) {
      return { success: false, error: "No store associated with this user." };
    }

    const {
      batchId,
      batchNumber,
      expiryDate,
      manufacturingDate,
      purchaseRate,
      mrp,
    } = input;

    if (!batchNumber || !batchNumber.trim()) {
      return { success: false, error: "Batch number is required." };
    }

    if (!expiryDate) {
      return { success: false, error: "Expiry date is required." };
    }

    if (mrp <= 0) {
      return { success: false, error: "MRP must be greater than 0." };
    }

    const existingBatch = await db.query.medicineBatch.findFirst({
      where: and(
        eq(medicineBatch.id, batchId),
        eq(medicineBatch.storeId, currentUser.storeId)
      ),
    });

    if (!existingBatch) {
      return { success: false, error: "Batch not found in your store." };
    }

    const mfgDate = manufacturingDate ? new Date(manufacturingDate) : null;
    const expDate = new Date(expiryDate);

    await db
      .update(medicineBatch)
      .set({
        batchNumber: batchNumber.trim().toUpperCase(),
        expiryDate: expDate,
        manufacturingDate: mfgDate,
        purchaseRate: purchaseRate !== undefined ? purchaseRate : null,
        mrp,
        updatedAt: new Date(),
      })
      .where(eq(medicineBatch.id, batchId));

    await logAudit(
      `BATCH_UPDATED_${batchNumber.toUpperCase()}`,
      currentUser.storeId,
      currentUser.name
    );

    try {
      revalidatePath("/dashboard/inventory");
      revalidatePath("/dashboard/medicines");
      revalidatePath("/dashboard/billing");
    } catch (e) {
      // safe fallback
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to update batch:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Deletes a batch if it has no sales history and is at 0 stock (or requested by admin to clear a mistake)
 */
export async function deleteBatch(batchId: string) {
  try {
    const session = await getCurrentUser();
    const currentUser = session.currentUser;

    if (currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Access denied. Only Admins can delete batches.",
      };
    }

    if (!currentUser.storeId) {
      return { success: false, error: "No store associated with this user." };
    }

    const existingBatch = await db.query.medicineBatch.findFirst({
      where: and(
        eq(medicineBatch.id, batchId),
        eq(medicineBatch.storeId, currentUser.storeId)
      ),
    });

    if (!existingBatch) {
      return { success: false, error: "Batch not found." };
    }

    await db.delete(medicineBatch).where(eq(medicineBatch.id, batchId));

    await logAudit(
      `BATCH_DELETED_${existingBatch.batchNumber}`,
      currentUser.storeId,
      currentUser.name
    );

    try {
      revalidatePath("/dashboard/inventory");
      revalidatePath("/dashboard/medicines");
      revalidatePath("/dashboard/billing");
    } catch (e) {
      // safe fallback
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to delete batch:", error);
    return { success: false, error: (error as Error).message };
  }
}
