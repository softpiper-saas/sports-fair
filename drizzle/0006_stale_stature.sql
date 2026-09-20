CREATE TYPE "public"."ad_slot_placement" AS ENUM('top_banner', 'article_header', 'in_article', 'sidebar', 'homepage_between_sections', 'sticky_mobile');--> statement-breakpoint
CREATE TABLE "ad_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slot_key" text NOT NULL,
	"label" text NOT NULL,
	"placement" "ad_slot_placement" NOT NULL,
	"html" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"page_type" text,
	"section_slug" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ad_slots_slot_key_unique" UNIQUE("slot_key")
);
--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "sponsored" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "sponsor_name" text;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "sponsor_logo_id" uuid;--> statement-breakpoint
ALTER TABLE "ad_slots" ADD CONSTRAINT "ad_slots_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ad_slots_active_placement_idx" ON "ad_slots" USING btree ("is_active","placement");--> statement-breakpoint
CREATE INDEX "ad_slots_page_type_idx" ON "ad_slots" USING btree ("page_type");--> statement-breakpoint
CREATE INDEX "ad_slots_section_slug_idx" ON "ad_slots" USING btree ("section_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "ad_slots_slot_key_idx" ON "ad_slots" USING btree ("slot_key");--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_sponsor_logo_id_media_assets_id_fk" FOREIGN KEY ("sponsor_logo_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "articles_sponsor_logo_id_idx" ON "articles" USING btree ("sponsor_logo_id");