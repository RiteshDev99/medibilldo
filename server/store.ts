"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { store, user as userTable } from "@/db/schema";
import { getCurrentUser } from "@/server/users";
import { storeSchema } from "@/lib/schemas/store";

export async function getCurrentStore() {
  try {
    const session = await getCurrentUser();
    const currentUser = session.currentUser;

    if (!currentUser) {
      return null;
    }

    if (currentUser.role === "ADMIN") {
      const s = await db.query.store.findFirst({
        where: eq(store.ownerId, currentUser.id),
      });
      return s || null;
    } else {
      if (!currentUser.storeId) {
        return null;
      }
      const s = await db.query.store.findFirst({
        where: eq(store.id, currentUser.storeId),
      });
      return s || null;
    }
  } catch (error) {
    console.error("Error in getCurrentStore:", error);
    return null;
  }
}

export async function createStore(rawData: unknown) {
  try {
    const session = await getCurrentUser();
    const currentUser = session.currentUser;

    if (currentUser.role !== "ADMIN") {
      return { success: false, error: "Access denied. Admin role required." };
    }

    // Check if store already exists for this admin
    const existingStore = await db.query.store.findFirst({
      where: eq(store.ownerId, currentUser.id),
    });

    if (existingStore) {
      return { success: false, error: "Store already exists for this admin." };
    }

    const parseResult = storeSchema.safeParse(rawData);
    if (!parseResult.success) {
      return {
        success: false,
        error: "Validation failed: " + parseResult.error.issues.map((issue) => issue.message).join(", "),
      };
    }

    const data = parseResult.data;
    const storeId = crypto.randomUUID();

    // Insert store and update user's storeId sequentially (due to neon-http driver limitations)
    await db.insert(store).values({
      id: storeId,
      ownerId: currentUser.id,
      storeName: data.storeName,
      legalName: data.legalName || null,
      ownerName: data.ownerName || null,
      phone: data.phone,
      alternatePhone: data.alternatePhone || null,
      email: data.email || null,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      gstNumber: data.gstNumber || null,
      drugLicenseNumber: data.drugLicenseNumber || null,
      pharmacyLicenseNumber: data.pharmacyLicenseNumber || null,
      logo: data.logo || null,
    });

    await db
      .update(userTable)
      .set({ storeId })
      .where(eq(userTable.id, currentUser.id));

    revalidatePath("/dashboard");
    return { success: true, storeId };
  } catch (error) {
    console.error("Error in createStore:", error);
    return { success: false, error: "Failed to create store." };
  }
}

export async function updateStore(rawData: unknown) {
  try {
    const session = await getCurrentUser();
    const currentUser = session.currentUser;

    if (currentUser.role !== "ADMIN") {
      return { success: false, error: "Access denied. Admin role required." };
    }

    const parseResult = storeSchema.safeParse(rawData);
    if (!parseResult.success) {
      return {
        success: false,
        error: "Validation failed: " + parseResult.error.issues.map((issue) => issue.message).join(", "),
      };
    }

    const data = parseResult.data;

    // Fetch store owned by this admin to check ownership
    const existingStore = await db.query.store.findFirst({
      where: eq(store.ownerId, currentUser.id),
    });

    if (!existingStore) {
      return { success: false, error: "Store not found or you do not have permission to edit." };
    }

    await db
      .update(store)
      .set({
        storeName: data.storeName,
        legalName: data.legalName || null,
        ownerName: data.ownerName || null,
        phone: data.phone,
        alternatePhone: data.alternatePhone || null,
        email: data.email || null,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        gstNumber: data.gstNumber || null,
        drugLicenseNumber: data.drugLicenseNumber || null,
        pharmacyLicenseNumber: data.pharmacyLicenseNumber || null,
        logo: data.logo || null,
        updatedAt: new Date(),
      })
      .where(eq(store.id, existingStore.id));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error in updateStore:", error);
    return { success: false, error: "Failed to update store." };
  }
}
