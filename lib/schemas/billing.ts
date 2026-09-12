import { z } from "zod";

export const cartItemInputSchema = z.object({
  medicineId: z.string().min(1, "Medicine ID is required"),
  batchId: z.string().min(1, "Batch ID is required"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than 0"),
  isPack: z.boolean().default(true),
  discountPercent: z.number().min(0).max(100).default(0),
  customRate: z.number().positive().optional(),
});

export type CartItemInput = z.infer<typeof cartItemInputSchema>;

export const createInvoiceInputSchema = z
  .object({
    items: z
      .array(cartItemInputSchema)
      .min(1, "Invoice must contain at least one item"),
    customerId: z.string().nullable().optional(),
    customerName: z
      .string()
      .min(1, "Customer name is required")
      .default("Walk-in Customer"),
    customerPhone: z.string().optional().nullable(),
    doctorName: z.string().optional().nullable(),
    paymentMode: z.enum(["CASH", "UPI", "CARD", "CREDIT"]),
    amountReceived: z.number().min(0).optional().nullable(),
    overallDiscountPercent: z.number().min(0).max(100).default(0),
  })
  .refine(
    (data) => {
      // If Credit / Udhar is chosen, customer must be identified
      if (data.paymentMode === "CREDIT") {
        return !!(
          data.customerId ||
          (data.customerName &&
            data.customerName !== "Walk-in Customer" &&
            data.customerPhone)
        );
      }
      return true;
    },
    {
      message:
        "Customer name and phone or existing customer profile is required for Credit (Udhar) sales.",
      path: ["paymentMode"],
    }
  );

export type CreateInvoiceInput = z.infer<typeof createInvoiceInputSchema>;

export const customerInputSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  doctorName: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export type CustomerInput = z.infer<typeof customerInputSchema>;

export const createBatchInputSchema = z.object({
  medicineId: z.string().min(1, "Medicine is required"),
  batchNumber: z.string().min(1, "Batch number is required"),
  manufacturingDate: z.string().optional().nullable(),
  expiryDate: z.string().min(1, "Expiry date is required"),
  stockQuantity: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative"),
  purchaseRate: z.number().min(0).optional().nullable(),
  mrp: z.number().positive("MRP must be greater than 0"),
});

export type CreateBatchInput = z.infer<typeof createBatchInputSchema>;
