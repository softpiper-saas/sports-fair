import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

export const articleStatus = pgEnum("article_status", ["draft", "review", "scheduled", "published", "archived"]);
export const breakingStatus = pgEnum("breaking_status", ["normal", "breaking", "major_breaking", "developing"]);
export const articleEngagementEventType = pgEnum("article_engagement_event_type", ["view", "share"]);
export const matchStatus = pgEnum("match_status", ["scheduled", "live", "completed", "postponed", "cancelled"]);
export const homepageSlotType = pgEnum("homepage_slot_type", [
  "lead",
  "secondary",
  "editor_pick",
  "cricket",
  "football",
  "video"
]);

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("emailVerified").default(false).notNull(),
    image: text("image"),
    role: text("role").default("journalist"),
    banned: boolean("banned").default(false),
    banReason: text("banReason"),
    banExpires: timestamp("banExpires", { withTimezone: true }),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index("user_email_idx").on(table.email)]
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonatedBy")
  },
  (table) => [index("session_user_id_idx").on(table.userId), index("session_token_idx").on(table.token)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    uniqueIndex("account_provider_account_idx").on(table.providerId, table.accountId)
  ]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nameBn: text("name_bn").notNull(),
    nameEn: text("name_en"),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    parentId: uuid("parent_id"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index("categories_parent_id_idx").on(table.parentId), index("categories_slug_idx").on(table.slug)]
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nameBn: text("name_bn").notNull(),
    nameEn: text("name_en"),
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index("tags_slug_idx").on(table.slug)]
);

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storageProvider: text("storage_provider").default("cloudflare_r2").notNull(),
    bucket: text("bucket").notNull(),
    objectKey: text("object_key").notNull(),
    publicUrl: text("public_url").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes"),
    altBn: text("alt_bn"),
    captionBn: text("caption_bn"),
    credit: text("credit"),
    createdById: text("created_by_id").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    uniqueIndex("media_assets_bucket_key_idx").on(table.bucket, table.objectKey),
    index("media_assets_created_by_idx").on(table.createdById)
  ]
);

export const videos = pgTable(
  "videos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    titleBn: text("title_bn").notNull(),
    titleEn: text("title_en"),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    videoUrl: text("video_url").notNull(),
    thumbnailId: uuid("thumbnail_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    createdById: text("created_by_id").references(() => user.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index("videos_category_id_idx").on(table.categoryId),
    index("videos_created_by_idx").on(table.createdById),
    index("videos_slug_idx").on(table.slug)
  ]
);

export const galleries = pgTable(
  "galleries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    titleBn: text("title_bn").notNull(),
    titleEn: text("title_en"),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    coverImageId: uuid("cover_image_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    createdById: text("created_by_id").references(() => user.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index("galleries_category_id_idx").on(table.categoryId),
    index("galleries_created_by_idx").on(table.createdById),
    index("galleries_slug_idx").on(table.slug)
  ]
);

export const galleryImages = pgTable(
  "gallery_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    galleryId: uuid("gallery_id")
      .notNull()
      .references(() => galleries.id, { onDelete: "cascade" }),
    mediaAssetId: uuid("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    captionBn: text("caption_bn"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index("gallery_images_gallery_id_idx").on(table.galleryId),
    uniqueIndex("gallery_images_gallery_asset_idx").on(table.galleryId, table.mediaAssetId)
  ]
);

export const sports = pgTable(
  "sports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nameBn: text("name_bn").notNull(),
    nameEn: text("name_en").notNull(),
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index("sports_slug_idx").on(table.slug)]
);

export const teams = pgTable(
  "teams",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sportId: uuid("sport_id")
      .notNull()
      .references(() => sports.id, { onDelete: "cascade" }),
    nameBn: text("name_bn").notNull(),
    nameEn: text("name_en"),
    slug: text("slug").notNull().unique(),
    country: text("country"),
    logoId: uuid("logo_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index("teams_sport_id_idx").on(table.sportId), index("teams_slug_idx").on(table.slug)]
);

export const players = pgTable(
  "players",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nameBn: text("name_bn").notNull(),
    nameEn: text("name_en"),
    slug: text("slug").notNull().unique(),
    country: text("country"),
    role: text("role"),
    dateOfBirth: date("date_of_birth"),
    imageId: uuid("image_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index("players_slug_idx").on(table.slug)]
);

export const playerTeams = pgTable(
  "player_teams",
  {
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    role: text("role"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [uniqueIndex("player_teams_player_team_idx").on(table.playerId, table.teamId)]
);

export const tournaments = pgTable(
  "tournaments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sportId: uuid("sport_id")
      .notNull()
      .references(() => sports.id, { onDelete: "cascade" }),
    nameBn: text("name_bn").notNull(),
    nameEn: text("name_en"),
    slug: text("slug").notNull().unique(),
    logoId: uuid("logo_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index("tournaments_sport_id_idx").on(table.sportId), index("tournaments_slug_idx").on(table.slug)]
);

export const seasons = pgTable(
  "seasons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    nameBn: text("name_bn").notNull(),
    nameEn: text("name_en"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index("seasons_tournament_id_idx").on(table.tournamentId)]
);

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    headlineBn: text("headline_bn").notNull(),
    headlineEn: text("headline_en"),
    slug: text("slug").notNull().unique(),
    summary: text("summary"),
    bodyJson: jsonb("body_json"),
    bodyHtml: text("body_html"),
    status: articleStatus("status").default("draft").notNull(),
    breaking: breakingStatus("breaking").default("normal").notNull(),
    featured: boolean("featured").default(false).notNull(),
    heroImageId: uuid("hero_image_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    authorId: text("author_id").references(() => user.id, { onDelete: "set null" }),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    canonicalUrl: text("canonical_url"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    contentUpdatedAt: timestamp("content_updated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index("articles_author_id_idx").on(table.authorId),
    index("articles_category_id_idx").on(table.categoryId),
    index("articles_published_at_idx").on(table.publishedAt),
    index("articles_slug_idx").on(table.slug),
    index("articles_status_idx").on(table.status)
  ]
);

export const articleTags = pgTable(
  "article_tags",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" })
  },
  (table) => [uniqueIndex("article_tags_article_tag_idx").on(table.articleId, table.tagId)]
);

export const articleTeams = pgTable(
  "article_teams",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" })
  },
  (table) => [uniqueIndex("article_teams_article_team_idx").on(table.articleId, table.teamId)]
);

export const articlePlayers = pgTable(
  "article_players",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" })
  },
  (table) => [uniqueIndex("article_players_article_player_idx").on(table.articleId, table.playerId)]
);

export const articleTournaments = pgTable(
  "article_tournaments",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" })
  },
  (table) => [uniqueIndex("article_tournaments_article_tournament_idx").on(table.articleId, table.tournamentId)]
);

export const matches = pgTable(
  "matches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sportId: uuid("sport_id")
      .notNull()
      .references(() => sports.id, { onDelete: "cascade" }),
    tournamentId: uuid("tournament_id").references(() => tournaments.id, { onDelete: "set null" }),
    seasonId: uuid("season_id").references(() => seasons.id, { onDelete: "set null" }),
    homeTeamId: uuid("home_team_id").references(() => teams.id, { onDelete: "set null" }),
    awayTeamId: uuid("away_team_id").references(() => teams.id, { onDelete: "set null" }),
    titleBn: text("title_bn").notNull(),
    titleEn: text("title_en"),
    slug: text("slug").notNull().unique(),
    status: matchStatus("status").default("scheduled").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    venueBn: text("venue_bn"),
    venueEn: text("venue_en"),
    broadcastInfo: text("broadcast_info"),
    homeScore: text("home_score"),
    awayScore: text("away_score"),
    scoreSummary: text("score_summary"),
    liveSummary: text("live_summary"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index("matches_sport_id_idx").on(table.sportId),
    index("matches_starts_at_idx").on(table.startsAt),
    index("matches_status_idx").on(table.status),
    index("matches_slug_idx").on(table.slug)
  ]
);

export const matchCommentary = pgTable(
  "match_commentary",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    sequence: integer("sequence").notNull(),
    clock: text("clock"),
    bodyBn: text("body_bn").notNull(),
    scoreSnapshot: text("score_snapshot"),
    createdById: text("created_by_id").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index("match_commentary_match_id_idx").on(table.matchId),
    uniqueIndex("match_commentary_match_sequence_idx").on(table.matchId, table.sequence)
  ]
);

export const standings = pgTable(
  "standings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    seasonId: uuid("season_id").references(() => seasons.id, { onDelete: "cascade" }),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    played: integer("played").default(0).notNull(),
    won: integer("won").default(0).notNull(),
    drawn: integer("drawn").default(0).notNull(),
    lost: integer("lost").default(0).notNull(),
    points: integer("points").default(0).notNull(),
    goalDifference: integer("goal_difference"),
    netRunRate: text("net_run_rate"),
    sortOrder: integer("sort_order").default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index("standings_tournament_id_idx").on(table.tournamentId),
    uniqueIndex("standings_scope_team_idx").on(table.tournamentId, table.seasonId, table.teamId)
  ]
);

export const homepageSlots = pgTable(
  "homepage_slots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slotType: homepageSlotType("slot_type").notNull(),
    label: text("label"),
    articleId: uuid("article_id").references(() => articles.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index("homepage_slots_type_order_idx").on(table.slotType, table.sortOrder)]
);

export const breakingNews = pgTable(
  "breaking_news",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    titleBn: text("title_bn").notNull(),
    summary: text("summary"),
    articleId: uuid("article_id").references(() => articles.id, { onDelete: "set null" }),
    priority: integer("priority").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isDeveloping: boolean("is_developing").default(false).notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    createdById: text("created_by_id").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index("breaking_news_active_window_idx").on(table.isActive, table.startsAt, table.endsAt),
    index("breaking_news_article_id_idx").on(table.articleId)
  ]
);

export const articleEngagementEvents = pgTable(
  "article_engagement_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    eventType: articleEngagementEventType("event_type").notNull(),
    path: text("path"),
    referrer: text("referrer"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index("article_engagement_article_created_idx").on(table.articleId, table.createdAt),
    index("article_engagement_type_created_idx").on(table.eventType, table.createdAt)
  ]
);
