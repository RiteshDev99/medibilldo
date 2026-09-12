import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified")
      .$defaultFn(() => false)
      .notNull(),
    image: text("image"),
    role: text("role").default("STAFF").notNull(),
    storeId: text("store_id"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("user_store_id_idx").on(table.storeId)]
);

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

export const medicine = pgTable(
  "medicine",
  {
    id: text("id").primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    shortName: text("short_name"),
    genericName: text("generic_name").notNull(),
    manufacturer: text("manufacturer").notNull(),
    brand: text("brand"),
    category: text("category").notNull(),
    productType: text("product_type"),
    packing: text("packing").notNull(),
    quantityVolume: text("quantity_volume"),
    uqcUnit: text("uqc_unit"),
    conversionFactor: integer("conversion_factor").default(1).notNull(),
    hsn: text("hsn"),
    gst: integer("gst").notNull(), // Percentage, e.g. 5, 12, 18, 28
    cess: doublePrecision("cess").default(0),
    mrp: doublePrecision("mrp").notNull(), // MRP in currency
    pRate: doublePrecision("p_rate"),
    cost: doublePrecision("cost"),
    rateA: doublePrecision("rate_a"),
    rateB: doublePrecision("rate_b"),
    rateC: doublePrecision("rate_c"),
    minimumQuantity: integer("minimum_quantity").default(0),
    maximumQuantity: integer("maximum_quantity"),
    reorderLevel: integer("reorder_level"),
    reorderQuantity: integer("reorder_quantity"),
    barcode: text("barcode"),
    drugSchedule: text("drug_schedule"),
    prescriptionRequired: boolean("prescription_required")
      .default(false)
      .notNull(),
    storageCondition: text("storage_condition"),
    status: text("status").default("ACTIVE").notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("medicine_store_id_idx").on(table.storeId),
    index("medicine_store_id_barcode_idx").on(table.storeId, table.barcode),
  ]
);

export type User = typeof user.$inferSelect;
export type Medicine = typeof medicine.$inferSelect;

export const store = pgTable(
  "store",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .unique()
      .references(() => user.id, { onDelete: "set null" }),
    storeName: text("store_name").notNull(),
    legalName: text("legal_name"),
    ownerName: text("owner_name"),
    phone: text("phone").notNull(),
    alternatePhone: text("alternate_phone"),
    email: text("email"),
    address: text("address").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    pincode: text("pincode").notNull(),
    gstNumber: text("gst_number"),
    drugLicenseNumber: text("drug_license_number"),
    pharmacyLicenseNumber: text("pharmacy_license_number"),
    logo: text("logo"),
    status: text("status").default("ACTIVE").notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [index("store_owner_id_idx").on(table.ownerId)]
);

export type Store = typeof store.$inferSelect;

export const audit = pgTable("audit", {
  id: text("id").primaryKey(),
  action: text("action").notNull(),
  storeId: text("store_id").notNull(),
  storeName: text("store_name").notNull(),
  performedBy: text("performed_by").notNull(),
  adminUserId: text("admin_user_id"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export type Audit = typeof audit.$inferSelect;

export const medicineBatch = pgTable(
  "medicine_batch",
  {
    id: text("id").primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    medicineId: text("medicine_id")
      .notNull()
      .references(() => medicine.id, { onDelete: "cascade" }),
    batchNumber: text("batch_number").notNull(),
    manufacturingDate: timestamp("manufacturing_date"),
    expiryDate: timestamp("expiry_date").notNull(),
    stockQuantity: integer("stock_quantity").default(0).notNull(),
    purchaseRate: doublePrecision("purchase_rate"),
    mrp: doublePrecision("mrp").notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("medicine_batch_store_id_idx").on(table.storeId),
    index("medicine_batch_medicine_id_idx").on(table.medicineId),
    index("medicine_batch_store_med_idx").on(table.storeId, table.medicineId),
    index("medicine_batch_store_batch_idx").on(
      table.storeId,
      table.batchNumber
    ),
    index("medicine_batch_expiry_idx").on(table.expiryDate),
  ]
);

export type MedicineBatch = typeof medicineBatch.$inferSelect;

export const customer = pgTable(
  "customer",
  {
    id: text("id").primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),
    doctorName: text("doctor_name"),
    address: text("address"),
    creditBalance: doublePrecision("credit_balance").default(0).notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("customer_store_id_idx").on(table.storeId),
    index("customer_store_phone_idx").on(table.storeId, table.phone),
  ]
);

export type Customer = typeof customer.$inferSelect;

export const invoice = pgTable(
  "invoice",
  {
    id: text("id").primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    invoiceNumber: text("invoice_number").notNull(),
    customerId: text("customer_id").references(() => customer.id, {
      onDelete: "set null",
    }),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone"),
    doctorName: text("doctor_name"),
    subtotal: doublePrecision("subtotal").notNull(),
    discount: doublePrecision("discount").default(0).notNull(),
    gstTotal: doublePrecision("gst_total").notNull(),
    cessTotal: doublePrecision("cess_total").default(0).notNull(),
    grandTotal: doublePrecision("grand_total").notNull(),
    paymentMode: text("payment_mode").notNull(), // CASH, UPI, CARD, CREDIT
    amountReceived: doublePrecision("amount_received"),
    changeReturned: doublePrecision("change_returned"),
    paymentStatus: text("payment_status").default("PAID").notNull(), // PAID, PENDING, PARTIAL
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("invoice_store_id_idx").on(table.storeId),
    index("invoice_store_number_idx").on(table.storeId, table.invoiceNumber),
    index("invoice_created_at_idx").on(table.createdAt),
  ]
);

export type Invoice = typeof invoice.$inferSelect;

export const invoiceItem = pgTable(
  "invoice_item",
  {
    id: text("id").primaryKey(),
    invoiceId: text("invoice_id")
      .notNull()
      .references(() => invoice.id, { onDelete: "cascade" }),
    medicineId: text("medicine_id").references(() => medicine.id, {
      onDelete: "set null",
    }),
    batchId: text("batch_id").references(() => medicineBatch.id, {
      onDelete: "set null",
    }),
    medicineName: text("medicine_name").notNull(),
    batchNumber: text("batch_number").notNull(),
    expiryDate: timestamp("expiry_date").notNull(),
    hsn: text("hsn"),
    quantity: integer("quantity").notNull(), // Sold in base units
    packUnit: text("pack_unit"), // Strip, Bottle, Box, etc.
    conversionFactor: integer("conversion_factor").default(1).notNull(),
    unitPrice: doublePrecision("unit_price").notNull(), // Rate per base unit
    mrp: doublePrecision("mrp").notNull(),
    discount: doublePrecision("discount").default(0).notNull(),
    gstPercent: integer("gst_percent").notNull(),
    gstAmount: doublePrecision("gst_amount").notNull(),
    cessAmount: doublePrecision("cess_amount").default(0).notNull(),
    total: doublePrecision("total").notNull(),
  },
  (table) => [
    index("invoice_item_invoice_id_idx").on(table.invoiceId),
    index("invoice_item_medicine_id_idx").on(table.medicineId),
    index("invoice_item_batch_id_idx").on(table.batchId),
  ]
);

export type InvoiceItem = typeof invoiceItem.$inferSelect;

export const stockMovement = pgTable(
  "stock_movement",
  {
    id: text("id").primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    medicineId: text("medicine_id")
      .notNull()
      .references(() => medicine.id, { onDelete: "cascade" }),
    batchId: text("batch_id")
      .notNull()
      .references(() => medicineBatch.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // SALE, PURCHASE, ADJUSTMENT, RETURN, DAMAGE, EXPIRY
    quantity: integer("quantity").notNull(), // -ve for sale, +ve for purchase
    previousStock: integer("previous_stock").notNull(),
    newStock: integer("new_stock").notNull(),
    referenceType: text("reference_type"), // INVOICE, PURCHASE, MANUAL
    referenceId: text("reference_id"),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("stock_movement_store_id_idx").on(table.storeId),
    index("stock_movement_batch_id_idx").on(table.batchId),
    index("stock_movement_ref_idx").on(table.referenceType, table.referenceId),
  ]
);

export type StockMovement = typeof stockMovement.$inferSelect;

export const schema = {
  user,
  session,
  account,
  verification,
  medicine,
  store,
  audit,
  medicineBatch,
  customer,
  invoice,
  invoiceItem,
  stockMovement,
};
