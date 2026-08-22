ALTER TABLE "store" DROP CONSTRAINT "store_owner_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "store" ADD CONSTRAINT "store_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "store_owner_id_idx" ON "store" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "user_store_id_idx" ON "user" USING btree ("store_id");