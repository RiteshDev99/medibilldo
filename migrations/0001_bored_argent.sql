CREATE TABLE "audit" (
	"id" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"store_id" text NOT NULL,
	"store_name" text NOT NULL,
	"performed_by" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "store" ADD COLUMN "status" text DEFAULT 'ACTIVE' NOT NULL;