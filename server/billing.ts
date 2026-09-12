"use server";

import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import {
  audit,
  customer,
  invoice,
  invoiceItem,
  medicine,
  medicineBatch,
  stockMovement,
  store,
  user,
} from "@/db/schema";
import {
  calculateInvoiceSummary,
  calculateItemTotals,
  round2,
} from "@/lib/billing-calc";
import {
  type CreateBatchInput,
  type CreateInvoiceInput,
  type CustomerInput,
  createBatchInputSchema,
  createInvoiceInputSchema,
  customerInputSchema,
} from "@/lib/schemas/billing";
import { getCurrentUser } from "./users";

/**
 * Validates the authenticated user and derives their tenant store.
 */
export async function getBillingContext() {
  const session = await getCurrentUser();
  const user = session.currentUser;

  if (user.role !== "ADMIN" && user.role !== "STAFF") {
    throw new Error("Access denied. Admin or Staff role required for billing.");
  }

  const storeId = user.storeId;
  if (!storeId) {
    throw new Error("No pharmacy store assigned to your account.");
  }

  const storeInfo = await db.query.store.findFirst({
    where: eq(store.id, storeId),
  });

  if (!storeInfo) {
    throw new Error("Pharmacy store profile not found.");
  }

  return {
    user,
    storeId,
    store: storeInfo,
  };
}

/**
 * Searches medicines for billing with their batches ordered by FEFO (First Expiry, First Out).
 */
export async function searchMedicinesForBilling(query: string) {
  try {
    const { storeId } = await getBillingContext();
    const cleanQuery = query.trim();

    let medsList: Array<typeof medicine.$inferSelect> = [];

    if (cleanQuery) {
      // Search barcode (exact or prefix), medicine name, short name, generic, or brand
      medsList = await db.query.medicine.findMany({
        where: and(
          eq(medicine.storeId, storeId),
          eq(medicine.status, "ACTIVE"),
          or(
            eq(medicine.barcode, cleanQuery),
            ilike(medicine.barcode, `${cleanQuery}%`),
            ilike(medicine.name, `%${cleanQuery}%`),
            ilike(medicine.shortName, `%${cleanQuery}%`),
            ilike(medicine.genericName, `%${cleanQuery}%`),
            ilike(medicine.brand, `%${cleanQuery}%`)
          )
        ),
        orderBy: [medicine.name],
        limit: 25,
      });
    } else {
      // Return top 15 recently active medicines
      medsList = await db.query.medicine.findMany({
        where: and(
          eq(medicine.storeId, storeId),
          eq(medicine.status, "ACTIVE")
        ),
        orderBy: [desc(medicine.createdAt)],
        limit: 15,
      });
    }

    if (medsList.length === 0) {
      return { success: true, medicines: [] };
    }

    const now = new Date();

    // Fetch batches for all matched medicines
    const medicineIds = medsList.map((m) => m.id);
    const batches = await db.query.medicineBatch.findMany({
      where: and(
        eq(medicineBatch.storeId, storeId),
        sql`${medicineBatch.medicineId} IN ${medicineIds}`
      ),
      orderBy: [medicineBatch.expiryDate],
    });

    // Map batches to each medicine
    const result = medsList.map((med) => {
      const medBatches = batches
        .filter((b) => b.medicineId === med.id)
        .map((b) => {
          const isExpired = new Date(b.expiryDate) < now;
          const reorderLevel = med.reorderLevel ?? 10;
          const isLowStock =
            b.stockQuantity > 0 && b.stockQuantity <= reorderLevel;

          return {
            ...b,
            isExpired,
            isLowStock,
            hasStock: b.stockQuantity > 0 && !isExpired,
          };
        });

      // Total available unexpired stock in base units
      const totalStock = medBatches.reduce(
        (sum, b) => (b.isExpired ? sum : sum + b.stockQuantity),
        0
      );

      // Earliest valid expiry batch for FEFO auto-selection
      const fefoBatch =
        medBatches.find((b) => b.hasStock) || medBatches[0] || null;

      return {
        ...med,
        totalStock,
        batches: medBatches,
        fefoBatch,
      };
    });

    return { success: true, medicines: result };
  } catch (error) {
    console.error("Error in searchMedicinesForBilling:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Searches customers by name or phone number.
 */
export async function searchCustomers(query: string) {
  try {
    const { storeId } = await getBillingContext();
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      const customers = await db.query.customer.findMany({
        where: eq(customer.storeId, storeId),
        orderBy: [desc(customer.createdAt)],
        limit: 10,
      });
      return { success: true, customers };
    }

    const customers = await db.query.customer.findMany({
      where: and(
        eq(customer.storeId, storeId),
        or(
          ilike(customer.phone, `${cleanQuery}%`),
          ilike(customer.name, `%${cleanQuery}%`)
        )
      ),
      orderBy: [customer.name],
      limit: 15,
    });

    return { success: true, customers };
  } catch (error) {
    console.error("Error in searchCustomers:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Creates a customer profile for billing records or credit/Udhar tracking.
 */
export async function createCustomer(rawData: CustomerInput) {
  try {
    const { storeId } = await getBillingContext();
    const parsed = customerInputSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(", "),
      };
    }

    const data = parsed.data;
    const newId = crypto.randomUUID();

    await db.insert(customer).values({
      id: newId,
      storeId,
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      doctorName: data.doctorName || null,
      address: data.address || null,
      creditBalance: 0,
    });

    const newCustomer = await db.query.customer.findFirst({
      where: eq(customer.id, newId),
    });

    return { success: true, customer: newCustomer };
  } catch (error) {
    console.error("Error in createCustomer:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Creates a new medicine batch (inward stock entry / initial stock).
 */
export async function createMedicineBatch(rawData: CreateBatchInput) {
  try {
    const { user, storeId } = await getBillingContext();
    const parsed = createBatchInputSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(", "),
      };
    }

    const data = parsed.data;

    // Verify medicine belongs to this store
    const med = await db.query.medicine.findFirst({
      where: and(
        eq(medicine.id, data.medicineId),
        eq(medicine.storeId, storeId)
      ),
    });

    if (!med) {
      return {
        success: false,
        error: "Medicine not found in your store catalog.",
      };
    }

    const batchId = crypto.randomUUID();
    const mfgDate = data.manufacturingDate
      ? new Date(data.manufacturingDate)
      : null;
    const expDate = new Date(data.expiryDate);

    if (expDate <= new Date()) {
      return { success: false, error: "Expiry date must be in the future." };
    }

    const q1 = db.insert(medicineBatch).values({
      id: batchId,
      storeId,
      medicineId: med.id,
      batchNumber: data.batchNumber.trim().toUpperCase(),
      manufacturingDate: mfgDate,
      expiryDate: expDate,
      stockQuantity: data.stockQuantity,
      purchaseRate: data.purchaseRate ?? null,
      mrp: data.mrp,
    });

    const q2 = db.insert(stockMovement).values({
      id: crypto.randomUUID(),
      storeId,
      medicineId: med.id,
      batchId,
      type: "PURCHASE",
      quantity: data.stockQuantity,
      previousStock: 0,
      newStock: data.stockQuantity,
      referenceType: "MANUAL",
      referenceId: null,
      createdBy: user.id,
    });

    await db.batch([q1, q2]);

    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard/medicines");

    return { success: true, batchId };
  } catch (error) {
    console.error("Error in createMedicineBatch:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Creates a sales invoice transactionally.
 * Validates stock, deducts batch inventory atomically, generates invoice, records stock movement, and updates credit.
 */
export async function createInvoice(rawData: CreateInvoiceInput) {
  try {
    const { user, storeId, store: storeInfo } = await getBillingContext();
    const parsed = createInvoiceInputSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(", "),
      };
    }

    const data = parsed.data;

    // Validate Customer if provided
    let customerRecord: typeof customer.$inferSelect | null = null;
    if (data.customerId) {
      const cust = await db.query.customer.findFirst({
        where: and(
          eq(customer.id, data.customerId),
          eq(customer.storeId, storeId)
        ),
      });
      if (!cust) {
        return {
          success: false,
          error: "Selected customer does not exist in this store.",
        };
      }
      customerRecord = cust;
    }

    if (
      data.paymentMode === "CREDIT" &&
      !customerRecord &&
      !data.customerPhone
    ) {
      return {
        success: false,
        error:
          "A registered customer with contact details is required for Credit (Udhar) sales.",
      };
    }

    const now = new Date();

    // Collect all medicines and batches
    const medIds = Array.from(new Set(data.items.map((i) => i.medicineId)));
    const batchIds = Array.from(new Set(data.items.map((i) => i.batchId)));

    const dbMeds = await db.query.medicine.findMany({
      where: and(
        eq(medicine.storeId, storeId),
        sql`${medicine.id} IN ${medIds}`
      ),
    });
    const medsMap = new Map(dbMeds.map((m) => [m.id, m]));

    const dbBatches = await db.query.medicineBatch.findMany({
      where: and(
        eq(medicineBatch.storeId, storeId),
        sql`${medicineBatch.id} IN ${batchIds}`
      ),
    });
    const batchesMap = new Map(dbBatches.map((b) => [b.id, b]));

    // Aggregate required units per batch in case same batch was entered multiple times
    const unitsRequestedPerBatch = new Map<string, number>();

    for (const item of data.items) {
      const med = medsMap.get(item.medicineId);
      if (!med) {
        return {
          success: false,
          error: `Medicine not found for item ${item.medicineId}`,
        };
      }

      const batch = batchesMap.get(item.batchId);
      if (!batch) {
        return { success: false, error: `Batch not found for ${med.name}` };
      }

      if (batch.medicineId !== med.id) {
        return {
          success: false,
          error: `Batch ${batch.batchNumber} does not belong to ${med.name}`,
        };
      }

      // Check expiry
      if (new Date(batch.expiryDate) <= now) {
        return {
          success: false,
          error: `Cannot sell expired medicine: ${med.name} (Batch ${batch.batchNumber}, expired on ${new Date(batch.expiryDate).toLocaleDateString()})`,
        };
      }

      const convFactor = med.conversionFactor || 1;
      const baseUnitsNeeded = item.isPack
        ? item.quantity * convFactor
        : item.quantity;
      const existing = unitsRequestedPerBatch.get(batch.id) || 0;
      unitsRequestedPerBatch.set(batch.id, existing + baseUnitsNeeded);
    }

    // Verify stock availability
    for (const [batchId, requestedUnits] of unitsRequestedPerBatch.entries()) {
      const batch = batchesMap.get(batchId)!;
      const med = medsMap.get(batch.medicineId)!;
      if (batch.stockQuantity < requestedUnits) {
        return {
          success: false,
          error: `Insufficient stock for ${med.name} (Batch ${batch.batchNumber}). Available: ${batch.stockQuantity} units, Requested: ${requestedUnits} units.`,
        };
      }
    }

    // Calculate line item totals and invoice summary
    const calculatedLineItems = data.items.map((item) => {
      const med = medsMap.get(item.medicineId)!;
      const batch = batchesMap.get(item.batchId)!;
      const convFactor = med.conversionFactor || 1;

      const calc = calculateItemTotals({
        quantity: item.quantity,
        isPack: item.isPack,
        conversionFactor: convFactor,
        packMrp: batch.mrp,
        customRate: item.customRate,
        discountPercent: item.discountPercent,
        gstPercent: med.gst,
        cessPercent: med.cess ?? 0,
      });

      return {
        item,
        med,
        batch,
        calc,
      };
    });

    const summary = calculateInvoiceSummary(
      calculatedLineItems.map((c) => c.calc),
      data.overallDiscountPercent
    );

    // Generate unique sequential invoice number
    const currentYear = now.getFullYear();
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoice)
      .where(eq(invoice.storeId, storeId));
    const nextSeq = Number(countResult[0]?.count || 0) + 1;
    const invoiceNumber = `INV-${currentYear}-${String(nextSeq).padStart(4, "0")}`;

    const invoiceId = crypto.randomUUID();
    const customerName =
      customerRecord?.name || data.customerName || "Walk-in Customer";
    const customerPhone = customerRecord?.phone || data.customerPhone || null;
    const doctorName = customerRecord?.doctorName || data.doctorName || null;

    // Build the atomic batch queries
    const batchQueries: any[] = [];

    // 1. Insert Invoice
    batchQueries.push(
      db.insert(invoice).values({
        id: invoiceId,
        storeId,
        invoiceNumber,
        customerId: customerRecord?.id || null,
        customerName,
        customerPhone,
        doctorName,
        subtotal: summary.subtotal,
        discount: summary.totalDiscount,
        gstTotal: summary.gstTotal,
        cessTotal: summary.cessTotal,
        grandTotal: summary.grandTotal,
        paymentMode: data.paymentMode,
        amountReceived: data.amountReceived ?? summary.grandTotal,
        changeReturned:
          data.paymentMode === "CASH" &&
          (data.amountReceived ?? 0) > summary.grandTotal
            ? round2((data.amountReceived ?? 0) - summary.grandTotal)
            : 0,
        paymentStatus: data.paymentMode === "CREDIT" ? "PENDING" : "PAID",
        createdBy: user.id,
      })
    );

    // 2. Insert Invoice Items
    for (const line of calculatedLineItems) {
      const lineItemId = crypto.randomUUID();
      batchQueries.push(
        db.insert(invoiceItem).values({
          id: lineItemId,
          invoiceId,
          medicineId: line.med.id,
          batchId: line.batch.id,
          medicineName: line.med.name,
          batchNumber: line.batch.batchNumber,
          expiryDate: new Date(line.batch.expiryDate),
          hsn: line.med.hsn || null,
          quantity: line.calc.baseUnitsSold,
          packUnit: line.item.isPack
            ? line.med.packing || "Strip"
            : line.med.uqcUnit || "Unit",
          conversionFactor: line.med.conversionFactor || 1,
          unitPrice: line.calc.unitPrice,
          mrp: line.batch.mrp,
          discount: line.calc.discountAmount,
          gstPercent: line.med.gst,
          gstAmount: line.calc.gstAmount,
          cessAmount: line.calc.cessAmount,
          total: line.calc.totalAmount,
        })
      );
    }

    // 3. Atomically Decrement Batch Stock & Record Stock Movement
    // Notice: The condition `stock_quantity >= ${units}` prevents negative inventory and concurrency race conditions
    for (const [batchId, units] of unitsRequestedPerBatch.entries()) {
      const batch = batchesMap.get(batchId)!;
      const prevStock = batch.stockQuantity;
      const newStock = prevStock - units;

      batchQueries.push(
        db
          .update(medicineBatch)
          .set({
            stockQuantity: sql`${medicineBatch.stockQuantity} - ${units}`,
            updatedAt: now,
          })
          .where(
            and(
              eq(medicineBatch.id, batchId),
              sql`${medicineBatch.stockQuantity} >= ${units}`
            )
          )
      );

      batchQueries.push(
        db.insert(stockMovement).values({
          id: crypto.randomUUID(),
          storeId,
          medicineId: batch.medicineId,
          batchId: batch.id,
          type: "SALE",
          quantity: -units,
          previousStock: prevStock,
          newStock,
          referenceType: "INVOICE",
          referenceId: invoiceId,
          createdBy: user.id,
        })
      );
    }

    // 4. Update Customer Credit Balance if Credit Payment Mode
    if (data.paymentMode === "CREDIT" && customerRecord) {
      batchQueries.push(
        db
          .update(customer)
          .set({
            creditBalance: sql`${customer.creditBalance} + ${summary.grandTotal}`,
            updatedAt: now,
          })
          .where(eq(customer.id, customerRecord.id))
      );
    }

    // 5. Insert Audit Log
    batchQueries.push(
      db.insert(audit).values({
        id: crypto.randomUUID(),
        action: `SALE_INVOICE_CREATED: ${invoiceNumber} (₹${summary.grandTotal})`,
        storeId,
        storeName: storeInfo.storeName,
        performedBy: user.name || user.email,
        adminUserId: user.role === "ADMIN" ? user.id : null,
      })
    );

    // Execute atomic batch transaction
    await db.batch(batchQueries as any);

    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard/medicines");

    return {
      success: true,
      invoiceId,
      invoiceNumber,
      grandTotal: summary.grandTotal,
    };
  } catch (error) {
    console.error("Error in createInvoice:", error);
    return {
      success: false,
      error: (error as Error).message || "Transaction failed.",
    };
  }
}

/**
 * Fetches a full invoice payload for receipt view and thermal/A4 printing.
 */
export async function getInvoiceById(invoiceId: string) {
  try {
    const { storeId } = await getBillingContext();

    const inv = await db.query.invoice.findFirst({
      where: and(eq(invoice.id, invoiceId), eq(invoice.storeId, storeId)),
    });

    if (!inv) {
      return { success: false, error: "Invoice not found." };
    }

    const items = await db.query.invoiceItem.findMany({
      where: eq(invoiceItem.invoiceId, inv.id),
    });

    const storeDetails = await db.query.store.findFirst({
      where: eq(store.id, storeId),
    });

    const cashierUser = await db.query.user.findFirst({
      where: eq(user.id, inv.createdBy),
    });

    return {
      success: true,
      invoice: inv,
      items,
      store: storeDetails,
      cashier: cashierUser?.name || "Staff",
    };
  } catch (error) {
    console.error("Error in getInvoiceById:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Helper to fetch medicine batches for a specific medicine.
 */
export async function getMedicineBatches(medicineId: string) {
  try {
    const { storeId } = await getBillingContext();
    const batches = await db.query.medicineBatch.findMany({
      where: and(
        eq(medicineBatch.storeId, storeId),
        eq(medicineBatch.medicineId, medicineId)
      ),
      orderBy: [medicineBatch.expiryDate],
    });

    const now = new Date();
    const mapped = batches.map((b) => ({
      ...b,
      isExpired: new Date(b.expiryDate) <= now,
    }));

    return { success: true, batches: mapped };
  } catch (error) {
    console.error("Error in getMedicineBatches:", error);
    return { success: false, error: (error as Error).message };
  }
}
