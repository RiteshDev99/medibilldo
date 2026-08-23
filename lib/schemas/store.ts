import * as z from "zod";

export const storeSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z
    .string()
    .min(1, "Pincode is required")
    .regex(/^\d{6}$/, "Pincode must be a 6-digit number"),
  legalName: z.string().optional().or(z.literal("")),
  ownerName: z.string().optional().or(z.literal("")),
  email: z
    .union([
      z.string().email("Invalid email address"),
      z.literal(""),
      z.undefined(),
    ])
    .optional(),
  alternatePhone: z.string().optional().or(z.literal("")),
  gstNumber: z
    .union([
      z
        .string()
        .regex(
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i,
          "Invalid GSTIN format"
        ),
      z.literal(""),
      z.undefined(),
    ])
    .optional(),
  drugLicenseNumber: z.string().optional().or(z.literal("")),
  pharmacyLicenseNumber: z.string().optional().or(z.literal("")),
  logo: z.string().optional().or(z.literal("")),
});

export type StoreSchemaValues = z.infer<typeof storeSchema>;
