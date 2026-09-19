# Sportsfair Execution Plan

This plan turns the Bangla-first sports platform idea into an incremental build path. The guiding principle is to model this as a connected sports platform, not a news site with score widgets attached.

Authentication will use Better Auth with PostgreSQL/Drizzle.

## Confirmed Technical Decisions

- Sports data entry: manual editorial entry for MVP.
- Live updates: polling for MVP, with SSE/WebSockets reserved for later.
- Search: PostgreSQL search first; Meilisearch/Typesense stays in the future plan.
- Media storage: Cloudflare R2.
- CMS/admin: build inside the same Next.js project.
- Accounts: staff-only authentication for MVP.
- URLs: Bangla slugs.
- Numerals: Bangla numerals by default.
- Ads: support both ad network scripts and custom direct-sold ad slots.
- Deployment: VPS.
- Email: Resend SMTP.
- Analytics: Google Analytics.
- Bangla font: SolaimanLipi primary, with Noto Sans Bengali and system fallbacks.

## Product North Star

Build a Bangla-first sports news and live match platform with:

- editorial news CMS
- live scores and match centers
- teams, players, tournaments, fixtures, results and standings as first-class entities
- Bangla-aware article, search, SEO and presentation
- personalization and fan features after the core publishing/sports-data system is stable

## Phase 0: Foundations

Goal: establish architecture, conventions and development workflow before product modules grow.

1. Confirm product scope for MVP.
   - MVP should include news CMS, articles, homepage control, breaking news, cricket/football sections, live scores, match pages, fixtures/results, standings, teams, players, tournaments, videos/photos, search, trending, SEO and ads.
   - Personalization, notifications, comments, quizzes and AI sports search should be Phase 2 unless explicitly pulled forward.

2. Confirm the primary user roles.
   - public reader
   - journalist
   - editor
   - admin
   - ad manager
   - moderator later

3. Add baseline app conventions.
   - route groups for public site and admin console
   - shared layout primitives
   - database migration workflow
   - validation and sanitization conventions
   - Bengali typography and numeral formatting utilities

4. Define environment strategy.
   - local development with Docker Compose
   - GitHub Actions for CI
   - VPS staging/production deployment target
   - process management, reverse proxy and SSL plan for VPS

Implementation decision: use Resend SMTP for staff login/password emails and Google Analytics for traffic reporting.

## Phase 1: Authentication, Authorization And Admin Shell

Goal: make the app safe to operate before editorial tools are built.

1. Install and configure Better Auth.
   - use PostgreSQL via Drizzle
   - add auth tables and migration
   - configure email/password login for admin users
   - add session handling for server components and route handlers
   - keep registration closed to staff-created accounts only

2. Model roles and permissions.
   - admin can manage everything
   - editor can publish, feature, break and revise content
   - journalist can draft and submit content
   - ad manager can configure ad slots
   - moderator role can be added later

3. Build admin shell.
   - `/admin`
   - protected layout
   - sidebar navigation
   - dashboard landing page
   - user menu and logout

4. Add route protection.
   - server-side guards for admin pages
   - API guards for mutations
   - role checks for publish/breaking/admin-only actions

Implementation decision: use staff-only email/password login for MVP. Start with enum roles unless permissions become more granular later.

## Phase 2: Core Domain Model

Goal: create durable sports/content schema before building pages.

1. Content entities.
   - articles
   - categories
   - tags
   - authors
   - videos
   - galleries
   - media assets
   - polls

2. Sports entities.
   - sports
   - teams
   - players
   - tournaments/competitions
   - seasons
   - matches
   - venues
   - officials
   - squads
   - standings

3. Real-time/editorial entities.
   - live blogs
   - live blog entries
   - match commentary entries
   - score snapshots
   - breaking news banners
   - homepage slots

4. Relationship tables.
   - article teams
   - article players
   - article tournaments
   - match teams
   - player teams
   - tournament teams

5. Bangla-specific fields.
   - `name_bn` and `name_en`
   - `headline_bn` and optional `headline_en`
   - Bangla slug support
   - Bangla numeral formatting at presentation layer

Implementation decision: start with manual-entry sports data and simple sport-specific score fields where needed. Avoid provider-specific schema assumptions until provider integration becomes real.

## Phase 3: Editorial CMS MVP

Goal: editors can create and publish the core public site content.

1. Article editor.
   - Bangla headline
   - summary
   - BlockNote rich body
   - hero image
   - category, tags, related teams, related players, related tournament
   - status: draft, review, scheduled, published, archived
   - breaking status: normal, breaking, major breaking, developing
   - featured flag
   - SEO title, description, canonical URL

2. Article workflow.
   - draft save
   - preview
   - publish
   - update timestamp
   - revision history later if not MVP

3. Media library.
   - upload image
   - alt text
   - caption
   - credit
   - reuse in article, gallery, team, player and tournament pages
   - store production assets in Cloudflare R2

4. Video CMS.
   - title
   - description
   - thumbnail
   - embed URL or uploaded asset
   - category
   - related entities

5. Gallery CMS.
   - gallery title
   - ordered images
   - captions and credits

Implementation decision: use BlockNote JSON as canonical body and store sanitized/rendered HTML as a cache for public rendering. Use local/dev-compatible upload flow backed by Cloudflare R2 in production.

## Phase 4: Public News Site MVP

Goal: launch the reader-facing news experience with strong Bangla presentation.

1. Public navigation.
   - হোম
   - সর্বশেষ
   - ক্রিকেট
   - ফুটবল
   - বাংলাদেশ
   - আন্তর্জাতিক
   - লাইভ স্কোর
   - ম্যাচ সূচি
   - ভিডিও
   - ছবি
   - মতামত

2. Homepage.
   - breaking ticker
   - lead story
   - secondary story grid
   - Live Now matches
   - today fixtures
   - latest news
   - Bangladesh news
   - cricket
   - football
   - popular
   - video
   - analysis/editorial

3. Listing pages.
   - latest
   - category pages
   - tag pages
   - author pages

4. Article page.
   - headline
   - summary
   - hero media
   - author
   - published and updated times
   - body
   - related teams/players
   - related stories
   - trending sidebar
   - social share
   - copy link
   - ad slots

5. Video and photo landing pages.

Implementation decision: use Bangla slugs and Bangla numerals by default. Use SolaimanLipi as the primary Bangla portal-style font, with Noto Sans Bengali and system fallbacks.

## Phase 5: Homepage Editorial Control And Breaking News

Goal: give editors direct control over the most important public surfaces.

1. Homepage slots.
   - lead story
   - story 2
   - story 3
   - editor picks
   - homepage cricket
   - homepage football
   - video highlight

2. Breaking news console.
   - active breaking banner
   - priority
   - linked article or plain text
   - start/end time
   - developing story state

3. Trending/most read.
   - track article views
   - track shares if available
   - periods: 1 hour, 24 hours, 7 days

Implementation decision: use first-party view/share events for in-app trending, and Google Analytics for reporting and editorial traffic analysis.

## Phase 6: Sports Data And Match Center MVP

Goal: make matches first-class and connect them to content.

1. Match model and admin.
   - sport
   - teams
   - tournament
   - venue
   - start time
   - status
   - score state
   - broadcast information
   - manual score/status updates from staff

2. Live score center.
   - `/live`
   - filters: সব, ক্রিকেট, ফুটবল
   - tabs: লাইভ, আজ, আগামীকাল, গতকালের ফলাফল
   - refresh data using lightweight polling

3. Match page.
   - `/match/[slug]`
   - overview
   - live
   - scorecard
   - commentary
   - stats
   - news
   - videos
   - lineup
   - poll live data while match is active

4. Fixtures/results.
   - `/schedule`
   - `/results`
   - filters by date, sport and Bangladesh

5. আজকের খেলা.
   - prominent page/section
   - broadcast channel field
   - start time localized for Bangla audience

Implementation decision: manual editorial sports data entry for MVP. Use polling for live score updates to keep the VPS deployment simple. Revisit SSE/WebSockets and Redis pub/sub after match-center usage is proven.

## Phase 7: Teams, Players, Tournaments And Standings

Goal: build the reusable sports knowledge graph.

1. Team pages.
   - latest news
   - fixtures
   - results
   - squad
   - stats
   - rankings
   - videos

2. Player profiles.
   - Bangla name
   - English name
   - image
   - team
   - role/position
   - country
   - age/date of birth
   - stats
   - recent form
   - stories and videos

3. Tournament pages.
   - overview
   - news
   - fixtures
   - results
   - points table
   - teams
   - stats
   - top players

4. Standings pages.
   - `/standings/[slug]`
   - cricket fields: M, W, L, Pts, NRR
   - football fields: P, W, D, L, GD, Pts

Implementation decision: manually curate initial teams, tournaments and stats.

## Phase 8: Search And SEO

Goal: make the site discoverable and useful.

1. Basic search.
   - article search
   - teams
   - players
   - tournaments
   - Bangla and English fields
   - PostgreSQL-backed search

2. SEO foundation.
   - metadata per page
   - OpenGraph
   - canonical URLs
   - Breadcrumb schema
   - NewsArticle schema
   - SportsEvent schema
   - XML sitemap
   - Google News sitemap

3. Bangla search improvements.
   - normalize Bangla/English numerals
   - search aliases
   - team/player alternate names

Implementation decision: use PostgreSQL search for MVP. Keep Meilisearch or Typesense as a future upgrade when content volume and search UX need it.

## Phase 9: Advertising

Goal: support revenue without hard-coding every placement.

1. Ad slot registry.
   - top banner
   - article header
   - in-article
   - sidebar
   - between homepage sections
   - sticky mobile banner

2. Admin ad configuration.
   - slot key
   - script/html
   - active state
   - targeting by section/page type
   - support network ad scripts
   - support custom direct-sold creative/snippets

3. Sponsored content.
   - sponsored article flag
   - sponsor name/logo
   - sponsored tournament/section later

Implementation decision: support both ad network scripts and custom direct-sold slots.

## Phase 10: Phase 2 Product Features

Goal: build engagement after core publishing and sports data are stable.

1. Personalization.
   - users follow teams and players
   - আমার খেলা feed
   - personalized fixtures and news
   - requires public reader accounts, so this is after MVP

2. Notifications.
   - breaking news
   - match start
   - wicket/goal
   - match result
   - favorite player/team updates

3. Comments/community.
   - article comments
   - moderation queue
   - match discussion later

4. Polls and quizzes.
   - poll widget
   - quiz content type
   - fan prediction games later

5. AI/sports-aware search.
   - answer score/time/stat queries
   - combine content and structured sports data

Future decision: notification channels, moderation workflow and whether AI search should use an external LLM provider.

## Recommended Build Order

1. Better Auth setup for staff-only auth and admin route protection.
2. Core database schema for users, roles, articles, categories, tags, media, teams, players, tournaments and matches.
3. Admin shell.
4. Article CMS with BlockNote, Zod validation and sanitize-html.
5. Public article pages and category pages.
6. Homepage layout and editorial slots.
7. Breaking news system.
8. Cloudflare R2 media library, videos and galleries.
9. Manual match admin, fixtures/results and আজকের খেলা.
10. Polling-based live score center and match pages.
11. Team, player and tournament pages.
12. Standings.
13. PostgreSQL search.
14. SEO sitemaps and structured data.
15. Ad network and custom direct-sold ad slots.
16. Trending/most-read.
17. Personalization and notifications.
18. Comments, polls and quizzes.

## Deferred Decisions

These are intentionally deferred:

1. Exact VPS stack: Docker Compose only, or Docker Compose behind Nginx/Caddy with systemd.
2. Backup strategy for PostgreSQL and Cloudflare R2.
