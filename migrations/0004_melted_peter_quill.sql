ALTER TABLE "medicine" ADD COLUMN "store_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "short_name" text;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "brand" text;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "product_type" text;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "packing" text NOT NULL;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "quantity_volume" text;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "uqc_unit" text;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "conversion_factor" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "cess" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "p_rate" double precision;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "cost" double precision;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "rate_a" double precision;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "rate_b" double precision;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "rate_c" double precision;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "minimum_quantity" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "maximum_quantity" integer;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "reorder_level" integer;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "reorder_quantity" integer;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "barcode" text;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "drug_schedule" text;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "prescription_required" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "medicine" ADD COLUMN "storage_condition" text;--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "medicine_store_id_idx" ON "medicine" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "medicine_store_id_barcode_idx" ON "medicine" USING btree ("store_id","barcode");