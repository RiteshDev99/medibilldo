import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
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
}, (table) => [
  index("user_store_id_idx").on(table.storeId),
]);

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

export const medicine = pgTable("medicine", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  genericName: text("generic_name").notNull(),
  category: text("category").notNull(),
  manufacturer: text("manufacturer").notNull(),
  hsn: text("hsn"),
  gst: integer("gst").notNull(), // Percentage, e.g. 5, 12, 18, 28
  mrp: doublePrecision("mrp").notNull(), // MRP in currency
  status: text("status").default("ACTIVE").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export type User = typeof user.$inferSelect;
export type Medicine = typeof medicine.$inferSelect;

export const store = pgTable("store", {
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
}, (table) => [
  index("store_owner_id_idx").on(table.ownerId),
]);

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

export const schema = {
  user,
  session,
  account,
  verification,
  medicine,
  store,
  audit,
};
