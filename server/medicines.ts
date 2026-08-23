"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { audit, medicine, store } from "@/db/schema";
import { getCurrentUser } from "./users";

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

export async function getMedicines() {
  try {
    const session = await getCurrentUser();
    const currentUser = session.currentUser;

    if (!currentUser.storeId) {
      return { success: false, error: "No store associated with this user." };
    }

    // Return medicines filtered strictly by storeId
    const data = await db.query.medicine.findMany({
      where: eq(medicine.storeId, currentUser.storeId),
      orderBy: [desc(medicine.createdAt)],
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to get medicines:", error);
    return { success: false, error: "Failed to fetch medicines" };
  }
}

export async function createMedicine(data: {
  name: string;
  shortName?: string;
  genericName: string;
  manufacturer: string;
  brand?: string;
  category: string;
  productType?: string;
  packing: string;
  quantityVolume?: string;
  uqcUnit?: string;
  conversionFactor: number;
  hsn?: string;
  gst: number;
  cess?: number;
  mrp: number;
  pRate?: number;
  cost?: number;
  rateA?: number;
  rateB?: number;
  rateC?: number;
  minimumQuantity?: number;
  maximumQuantity?: number;
  reorderLevel?: number;
  reorderQuantity?: number;
  barcode?: string;
  drugSchedule?: string;
  prescriptionRequired: boolean;
  storageCondition?: string;
  status: string;
}) {
  try {
    const session = await getCurrentUser();
    const currentUser = session.currentUser;

    // Verify role permissions
    if (currentUser.role !== "ADMIN") {
      return { success: false, error: "Access denied. Admin role required." };
    }

    const storeId = currentUser.storeId;
    if (!storeId) {
      return {
        success: false,
        error: "Store Admin does not have an assigned store.",
      };
    }

    // Server-side validation
    if (
      !(
        data.name &&
        data.packing &&
        data.genericName &&
        data.category &&
        data.manufacturer
      )
    ) {
      return { success: false, error: "Required fields are missing." };
    }
    if (data.conversionFactor <= 0) {
      return {
        success: false,
        error: "Conversion Factor must be a positive integer.",
      };
    }
    if (data.mrp <= 0) {
      return { success: false, error: "MRP must be a positive number." };
    }
    if (data.minimumQuantity !== undefined && data.minimumQuantity < 0) {
      return {
        success: false,
        error: "Minimum Quantity must be non-negative.",
      };
    }
    if (
      data.maximumQuantity !== undefined &&
      data.minimumQuantity !== undefined &&
      data.maximumQuantity < data.minimumQuantity
    ) {
      return {
        success: false,
        error: "Maximum Quantity cannot be less than Minimum Quantity.",
      };
    }

    // Verify barcode uniqueness within the store if barcode is provided
    if (data.barcode) {
      const existingBarcode = await db.query.medicine.findFirst({
        where: and(
          eq(medicine.storeId, storeId),
          eq(medicine.barcode, data.barcode)
        ),
      });
      if (existingBarcode) {
        return {
          success: false,
          error: `Barcode '${data.barcode}' is already in use by another product in this store.`,
        };
      }
    }

    const id = crypto.randomUUID();
    await db.insert(medicine).values({
      id,
      storeId,
      name: data.name,
      shortName: data.shortName || null,
      genericName: data.genericName,
      manufacturer: data.manufacturer,
      brand: data.brand || null,
      category: data.category,
      productType: data.productType || null,
      packing: data.packing,
      quantityVolume: data.quantityVolume || null,
      uqcUnit: data.uqcUnit || null,
      conversionFactor: Math.floor(data.conversionFactor),
      hsn: data.hsn || null,
      gst: data.gst,
      cess: data.cess ?? 0,
      mrp: data.mrp,
      pRate: data.pRate ?? null,
      cost: data.cost ?? null,
      rateA: data.rateA ?? null,
      rateB: data.rateB ?? null,
      rateC: data.rateC ?? null,
      minimumQuantity: data.minimumQuantity ?? 0,
      maximumQuantity: data.maximumQuantity ?? null,
      reorderLevel: data.reorderLevel ?? null,
      reorderQuantity: data.reorderQuantity ?? null,
      barcode: data.barcode || null,
      drugSchedule: data.drugSchedule || null,
      prescriptionRequired: data.prescriptionRequired,
      storageCondition: data.storageCondition || null,
      status: data.status || "ACTIVE",
    });

    await logAudit("MEDICINE_CREATED", storeId, currentUser.name);

    try {
      revalidatePath("/dashboard/medicines");
    } catch (e) {
      // Ignore missing Next.js routing context in test execution environments
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to create medicine:", error);
    return { success: false, error: "Failed to create medicine" };
  }
}

export async function updateMedicine(
  id: string,
  data: {
    name: string;
    shortName?: string;
    genericName: string;
    manufacturer: string;
    brand?: string;
    category: string;
    productType?: string;
    packing: string;
    quantityVolume?: string;
    uqcUnit?: string;
    conversionFactor: number;
    hsn?: string;
    gst: number;
    cess?: number;
    mrp: number;
    pRate?: number;
    cost?: number;
    rateA?: number;
    rateB?: number;
    rateC?: number;
    minimumQuantity?: number;
    maximumQuantity?: number;
    reorderLevel?: number;
    reorderQuantity?: number;
    barcode?: string;
    drugSchedule?: string;
    prescriptionRequired: boolean;
    storageCondition?: string;
    status: string;
  }
) {
  try {
    const session = await getCurrentUser();
    const currentUser = session.currentUser;

    // Verify role permissions
    if (currentUser.role !== "ADMIN") {
      return { success: false, error: "Access denied. Admin role required." };
    }

    const storeId = currentUser.storeId;
    if (!storeId) {
      return {
        success: false,
        error: "Store Admin does not have an assigned store.",
      };
    }

    const existingMedicine = await db.query.medicine.findFirst({
      where: eq(medicine.id, id),
    });

    if (!existingMedicine) {
      return { success: false, error: "Medicine not found." };
    }

    // Verify store ownership
    if (existingMedicine.storeId !== storeId) {
      return {
        success: false,
        error: "Access denied. You cannot modify medicines of other stores.",
      };
    }

    // Server-side validation
    if (
      !(
        data.name &&
        data.packing &&
        data.genericName &&
        data.category &&
        data.manufacturer
      )
    ) {
      return { success: false, error: "Required fields are missing." };
    }
    if (data.conversionFactor <= 0) {
      return {
        success: false,
        error: "Conversion Factor must be a positive integer.",
      };
    }
    if (data.mrp <= 0) {
      return { success: false, error: "MRP must be a positive number." };
    }
    if (data.minimumQuantity !== undefined && data.minimumQuantity < 0) {
      return {
        success: false,
        error: "Minimum Quantity must be non-negative.",
      };
    }
    if (
      data.maximumQuantity !== undefined &&
      data.minimumQuantity !== undefined &&
      data.maximumQuantity < data.minimumQuantity
    ) {
      return {
        success: false,
        error: "Maximum Quantity cannot be less than Minimum Quantity.",
      };
    }

    // Verify barcode uniqueness within the store if barcode is provided
    if (data.barcode && data.barcode !== existingMedicine.barcode) {
      const existingBarcode = await db.query.medicine.findFirst({
        where: and(
          eq(medicine.storeId, storeId),
          eq(medicine.barcode, data.barcode)
        ),
      });
      if (existingBarcode) {
        return {
          success: false,
          error: `Barcode '${data.barcode}' is already in use by another product in this store.`,
        };
      }
    }

    await db
      .update(medicine)
      .set({
        name: data.name,
        shortName: data.shortName || null,
        genericName: data.genericName,
        manufacturer: data.manufacturer,
        brand: data.brand || null,
        category: data.category,
        productType: data.productType || null,
        packing: data.packing,
        quantityVolume: data.quantityVolume || null,
        uqcUnit: data.uqcUnit || null,
        conversionFactor: Math.floor(data.conversionFactor),
        hsn: data.hsn || null,
        gst: data.gst,
        cess: data.cess ?? 0,
        mrp: data.mrp,
        pRate: data.pRate ?? null,
        cost: data.cost ?? null,
        rateA: data.rateA ?? null,
        rateB: data.rateB ?? null,
        rateC: data.rateC ?? null,
        minimumQuantity: data.minimumQuantity ?? 0,
        maximumQuantity: data.maximumQuantity ?? null,
        reorderLevel: data.reorderLevel ?? null,
        reorderQuantity: data.reorderQuantity ?? null,
        barcode: data.barcode || null,
        drugSchedule: data.drugSchedule || null,
        prescriptionRequired: data.prescriptionRequired,
        storageCondition: data.storageCondition || null,
        status: data.status,
        updatedAt: new Date(),
      })
      .where(eq(medicine.id, id));

    await logAudit("MEDICINE_UPDATED", storeId, currentUser.name);

    try {
      revalidatePath("/dashboard/medicines");
    } catch (e) {
      // Ignore missing Next.js routing context in test execution environments
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to update medicine:", error);
    return { success: false, error: "Failed to update medicine" };
  }
}

export async function deleteMedicine(id: string) {
  try {
    const session = await getCurrentUser();
    const currentUser = session.currentUser;

    // Verify role permissions
    if (currentUser.role !== "ADMIN") {
      return { success: false, error: "Access denied. Admin role required." };
    }

    const storeId = currentUser.storeId;
    if (!storeId) {
      return {
        success: false,
        error: "Store Admin does not have an assigned store.",
      };
    }

    const existingMedicine = await db.query.medicine.findFirst({
      where: eq(medicine.id, id),
    });

    if (!existingMedicine) {
      return { success: false, error: "Medicine not found." };
    }

    // Verify store ownership
    if (existingMedicine.storeId !== storeId) {
      return {
        success: false,
        error: "Access denied. You cannot delete medicines of other stores.",
      };
    }

    // Hard delete is allowed since there are no other tables referencing medicine yet.
    await db.delete(medicine).where(eq(medicine.id, id));

    await logAudit("MEDICINE_DEACTIVATED", storeId, currentUser.name);

    try {
      revalidatePath("/dashboard/medicines");
    } catch (e) {
      // Ignore missing Next.js routing context in test execution environments
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to delete medicine:", error);
    return { success: false, error: "Failed to delete medicine" };
  }
}
