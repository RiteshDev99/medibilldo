CREATE TABLE "customer" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"doctor_name" text,
	"address" text,
	"credit_balance" double precision DEFAULT 0 NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"invoice_number" text NOT NULL,
	"customer_id" text,
	"customer_name" text NOT NULL,
	"customer_phone" text,
	"doctor_name" text,
	"subtotal" double precision NOT NULL,
	"discount" double precision DEFAULT 0 NOT NULL,
	"gst_total" double precision NOT NULL,
	"cess_total" double precision DEFAULT 0 NOT NULL,
	"grand_total" double precision NOT NULL,
	"payment_mode" text NOT NULL,
	"amount_received" double precision,
	"change_returned" double precision,
	"payment_status" text DEFAULT 'PAID' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_item" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"medicine_id" text,
	"batch_id" text,
	"medicine_name" text NOT NULL,
	"batch_number" text NOT NULL,
	"expiry_date" timestamp NOT NULL,
	"hsn" text,
	"quantity" integer NOT NULL,
	"pack_unit" text,
	"conversion_factor" integer DEFAULT 1 NOT NULL,
	"unit_price" double precision NOT NULL,
	"mrp" double precision NOT NULL,
	"discount" double precision DEFAULT 0 NOT NULL,
	"gst_percent" integer NOT NULL,
	"gst_amount" double precision NOT NULL,
	"cess_amount" double precision DEFAULT 0 NOT NULL,
	"total" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medicine_batch" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"medicine_id" text NOT NULL,
	"batch_number" text NOT NULL,
	"manufacturing_date" timestamp,
	"expiry_date" timestamp NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"purchase_rate" double precision,
	"mrp" double precision NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_movement" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"medicine_id" text NOT NULL,
	"batch_id" text NOT NULL,
	"type" text NOT NULL,
	"quantity" integer NOT NULL,
	"previous_stock" integer NOT NULL,
	"new_stock" integer NOT NULL,
	"reference_type" text,
	"reference_id" text,
	"created_by" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_item" ADD CONSTRAINT "invoice_item_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_item" ADD CONSTRAINT "invoice_item_medicine_id_medicine_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicine"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_item" ADD CONSTRAINT "invoice_item_batch_id_medicine_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."medicine_batch"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_batch" ADD CONSTRAINT "medicine_batch_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_batch" ADD CONSTRAINT "medicine_batch_medicine_id_medicine_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicine"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_medicine_id_medicine_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicine"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_batch_id_medicine_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."medicine_batch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customer_store_id_idx" ON "customer" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "customer_store_phone_idx" ON "customer" USING btree ("store_id","phone");--> statement-breakpoint
CREATE INDEX "invoice_store_id_idx" ON "invoice" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "invoice_store_number_idx" ON "invoice" USING btree ("store_id","invoice_number");--> statement-breakpoint
CREATE INDEX "invoice_created_at_idx" ON "invoice" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "invoice_item_invoice_id_idx" ON "invoice_item" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "invoice_item_medicine_id_idx" ON "invoice_item" USING btree ("medicine_id");--> statement-breakpoint
CREATE INDEX "invoice_item_batch_id_idx" ON "invoice_item" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "medicine_batch_store_id_idx" ON "medicine_batch" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "medicine_batch_medicine_id_idx" ON "medicine_batch" USING btree ("medicine_id");--> statement-breakpoint
CREATE INDEX "medicine_batch_store_med_idx" ON "medicine_batch" USING btree ("store_id","medicine_id");--> statement-breakpoint
CREATE INDEX "medicine_batch_store_batch_idx" ON "medicine_batch" USING btree ("store_id","batch_number");--> statement-breakpoint
CREATE INDEX "medicine_batch_expiry_idx" ON "medicine_batch" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "stock_movement_store_id_idx" ON "stock_movement" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "stock_movement_batch_id_idx" ON "stock_movement" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "stock_movement_ref_idx" ON "stock_movement" USING btree ("reference_type","reference_id");