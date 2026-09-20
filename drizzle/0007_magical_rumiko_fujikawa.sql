CREATE TYPE "public"."comment_status" AS ENUM('pending', 'approved', 'rejected', 'spam');--> statement-breakpoint
CREATE TABLE "article_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"author_name" text NOT NULL,
	"author_email" text,
	"body" text NOT NULL,
	"status" "comment_status" DEFAULT 'pending' NOT NULL,
	"ip_hash" text,
	"user_agent" text,
	"moderated_by_id" text,
	"moderated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" uuid NOT NULL,
	"label_bn" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" uuid NOT NULL,
	"option_id" uuid NOT NULL,
	"voter_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "polls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid,
	"question_bn" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_moderated_by_id_user_id_fk" FOREIGN KEY ("moderated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_options" ADD CONSTRAINT "poll_options_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_option_id_poll_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."poll_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "article_comments_article_status_idx" ON "article_comments" USING btree ("article_id","status");--> statement-breakpoint
CREATE INDEX "article_comments_status_created_idx" ON "article_comments" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "poll_options_poll_order_idx" ON "poll_options" USING btree ("poll_id","sort_order");--> statement-breakpoint
CREATE INDEX "poll_votes_option_id_idx" ON "poll_votes" USING btree ("option_id");--> statement-breakpoint
CREATE UNIQUE INDEX "poll_votes_poll_voter_idx" ON "poll_votes" USING btree ("poll_id","voter_key");--> statement-breakpoint
CREATE INDEX "polls_active_window_idx" ON "polls" USING btree ("is_active","starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "polls_article_id_idx" ON "polls" USING btree ("article_id");