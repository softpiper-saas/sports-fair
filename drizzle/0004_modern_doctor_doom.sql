CREATE TYPE "public"."article_engagement_event_type" AS ENUM('view', 'share');--> statement-breakpoint
CREATE TABLE "article_engagement_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"event_type" "article_engagement_event_type" NOT NULL,
	"path" text,
	"referrer" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "breaking_news" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_bn" text NOT NULL,
	"summary" text,
	"article_id" uuid,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_developing" boolean DEFAULT false NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "article_engagement_events" ADD CONSTRAINT "article_engagement_events_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breaking_news" ADD CONSTRAINT "breaking_news_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breaking_news" ADD CONSTRAINT "breaking_news_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "article_engagement_article_created_idx" ON "article_engagement_events" USING btree ("article_id","created_at");--> statement-breakpoint
CREATE INDEX "article_engagement_type_created_idx" ON "article_engagement_events" USING btree ("event_type","created_at");--> statement-breakpoint
CREATE INDEX "breaking_news_active_window_idx" ON "breaking_news" USING btree ("is_active","starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "breaking_news_article_id_idx" ON "breaking_news" USING btree ("article_id");