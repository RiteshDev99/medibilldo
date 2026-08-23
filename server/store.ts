"use server";

import { desc, eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { audit, store, user as userTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { storeSchema } from "@/lib/schemas/store";
import { requireSuperAdmin } from "@/server/permissions";
import { getCurrentUser } from "@/server/users";

export async function getCurrentStore() {
  try {
    const session = await getCurrentUser();
    const currentUser = session.currentUser;

    if (!currentUser) {
      return null;
    }

    if (currentUser.role === "SUPER_ADMIN") {
      return null;
    }

    if (currentUser.role === "ADMIN") {
      const s = await db.query.store.findFirst({
        where: eq(store.ownerId, currentUser.id),
      });
      return s || null;
    }
    if (!currentUser.storeId) {
      return null;
    }
    const s = await db.query.store.findFirst({
      where: eq(store.id, currentUser.storeId),
    });
    return s || null;
  } catch (error) {
    console.error("Error in getCurrentStore:", error);
    return null;
  }
}

export async function createStore(rawData: unknown) {
  try {
    const session = await getCurrentUser();
    const currentUser = session.currentUser;

    if (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
      return { success: false, error: "Access denied. Admin role required." };
    }

    const parseResult = storeSchema.safeParse(rawData);
    if (!parseResult.success) {
      return {
        success: false,
        error:
          "Validation failed: " +
          parseResult.error.issues.map((issue) => issue.message).join(", "),
      };
    }

    const data = parseResult.data;
    const storeId = crypto.randomUUID();

    if (currentUser.role === "SUPER_ADMIN") {
      // Super Admin creates a store with ownerId = NULL and does not assign storeId to themselves.
      await db.insert(store).values({
        id: storeId,
        ownerId: null,
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

      await logAudit(
        "Store Created",
        storeId,
        data.storeName,
        currentUser.name
      );

      revalidatePath("/dashboard");
      return { success: true, storeId };
    }

    // Check if store already exists for this admin
    const existingStore = await db.query.store.findFirst({
      where: eq(store.ownerId, currentUser.id),
    });

    if (existingStore) {
      return { success: false, error: "Store already exists for this admin." };
    }

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
        error:
          "Validation failed: " +
          parseResult.error.issues.map((issue) => issue.message).join(", "),
      };
    }

    const data = parseResult.data;

    // Fetch store owned by this admin to check ownership
    const existingStore = await db.query.store.findFirst({
      where: eq(store.ownerId, currentUser.id),
    });

    if (!existingStore) {
      return {
        success: false,
        error: "Store not found or you do not have permission to edit.",
      };
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

async function logAudit(
  action: string,
  storeId: string,
  storeName: string,
  performedBy: string,
  adminUserId?: string
) {
  try {
    await db.insert(audit).values({
      id: crypto.randomUUID(),
      action,
      storeId,
      storeName,
      performedBy,
      adminUserId: adminUserId || null,
    });
  } catch (error) {
    console.error("Failed to log audit:", error);
  }
}

export async function getAllStores(searchQuery?: string) {
  try {
    await requireSuperAdmin();

    let whereClause;
    if (searchQuery) {
      whereClause = or(
        ilike(store.storeName, `%${searchQuery}%`),
        ilike(store.legalName, `%${searchQuery}%`),
        ilike(store.city, `%${searchQuery}%`),
        ilike(store.phone, `%${searchQuery}%`),
        ilike(store.gstNumber, `%${searchQuery}%`)
      );
    }

    const data = await db.query.store.findMany({
      where: whereClause,
      orderBy: [desc(store.createdAt)],
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error in getAllStores:", error);
    return { success: false, error: "Failed to fetch stores." };
  }
}

export async function getStoreDetails(storeId: string) {
  try {
    await requireSuperAdmin();

    const data = await db.query.store.findFirst({
      where: eq(store.id, storeId),
    });

    if (!data) {
      return { success: false, error: "Store not found." };
    }

    let owner = null;
    if (data.ownerId) {
      owner = await db.query.user.findFirst({
        where: eq(userTable.id, data.ownerId),
      });
    }

    return { success: true, data, owner };
  } catch (error) {
    console.error("Error in getStoreDetails:", error);
    return { success: false, error: "Failed to fetch store details." };
  }
}

export async function updateStoreStatus(
  storeId: string,
  status: "ACTIVE" | "INACTIVE"
) {
  try {
    const session = await requireSuperAdmin();
    const currentUser = session.currentUser;

    const data = await db.query.store.findFirst({
      where: eq(store.id, storeId),
    });

    if (!data) {
      return { success: false, error: "Store not found." };
    }

    await db
      .update(store)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(store.id, storeId));

    const actionText =
      status === "ACTIVE" ? "Store Activated" : "Store Deactivated";
    await logAudit(actionText, storeId, data.storeName, currentUser.name);

    revalidatePath("/super-admin");
    revalidatePath(`/super-admin/stores/${storeId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error in updateStoreStatus:", error);
    return { success: false, error: "Failed to update store status." };
  }
}

export async function getAuditLogs() {
  try {
    await requireSuperAdmin();

    const data = await db.query.audit.findMany({
      orderBy: [desc(audit.createdAt)],
      limit: 50,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error in getAuditLogs:", error);
    return { success: false, error: "Failed to fetch audit logs." };
  }
}

export async function createStoreAdminAccess(
  storeId: string,
  data: { name: string; email: string; phone?: string; password?: string }
) {
  try {
    const session = await requireSuperAdmin();
    const currentUser = session.currentUser;

    if (!(data.name && data.email && data.password)) {
      return {
        success: false,
        error: "Name, email, and password are required.",
      };
    }

    // Check store
    const existingStore = await db.query.store.findFirst({
      where: eq(store.id, storeId),
    });

    if (!existingStore) {
      return { success: false, error: "Store not found." };
    }

    if (existingStore.status !== "ACTIVE") {
      return {
        success: false,
        error: "This store is currently inactive. Please activate it first.",
      };
    }

    if (existingStore.ownerId) {
      return {
        success: false,
        error: "This store already has an Admin assigned.",
      };
    }

    // Check email uniqueness
    const existingUser = await db.query.user.findFirst({
      where: eq(userTable.email, data.email),
    });

    if (existingUser) {
      return { success: false, error: "This email is already registered." };
    }

    // Create user via Better Auth
    const newUser = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: "ADMIN",
      },
    });

    if (!(newUser && newUser.user)) {
      return { success: false, error: "Failed to create Admin user." };
    }

    const adminUserId = newUser.user.id;

    // Update user's storeId
    await db
      .update(userTable)
      .set({ storeId })
      .where(eq(userTable.id, adminUserId));

    // Update store's ownerId
    await db
      .update(store)
      .set({ ownerId: adminUserId })
      .where(eq(store.id, storeId));

    // Log audit
    await logAudit(
      "STORE_ADMIN_CREATED",
      storeId,
      existingStore.storeName,
      currentUser.name,
      adminUserId
    );

    revalidatePath("/super-admin");
    revalidatePath(`/super-admin/stores/${storeId}`);
    return { success: true };
  } catch (error) {
    console.error("Error in createStoreAdminAccess:", error);
    const err = error as Error;
    return {
      success: false,
      error: err.message || "Failed to create store Admin access.",
    };
  }
}
