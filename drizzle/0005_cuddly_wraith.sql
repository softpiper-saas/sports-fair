ALTER TABLE "matches" ADD COLUMN "source_provider" text;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "source_id" text;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "source_url" text;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "raw_payload" jsonb;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "last_synced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN "source_provider" text;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN "source_id" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "source_provider" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "source_id" text;--> statement-breakpoint
ALTER TABLE "tournaments" ADD COLUMN "source_provider" text;--> statement-breakpoint
ALTER TABLE "tournaments" ADD COLUMN "source_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX "matches_source_provider_id_idx" ON "matches" USING btree ("source_provider","source_id");--> statement-breakpoint
CREATE UNIQUE INDEX "seasons_source_provider_id_idx" ON "seasons" USING btree ("source_provider","source_id");--> statement-breakpoint
CREATE UNIQUE INDEX "teams_source_provider_id_idx" ON "teams" USING btree ("source_provider","source_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tournaments_source_provider_id_idx" ON "tournaments" USING btree ("source_provider","source_id");