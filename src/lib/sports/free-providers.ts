import { createBanglaSlug, ensureSlug } from "@/lib/slug";
import type { NormalizedMatch } from "@/lib/sports/provider-types";

type CricsheetMatch = {
  meta?: { data_version?: string; created?: string; revision?: number };
  info?: {
    dates?: string[];
    event?: { name?: string; match_number?: number | string; stage?: string };
    teams?: string[];
    venue?: string;
    city?: string;
    match_type?: string;
    outcome?: { winner?: string; result?: string; by?: Record<string, unknown> };
  };
  innings?: Array<{
    team?: string;
    overs?: Array<{
      over?: number;
      deliveries?: Array<{
        runs?: { total?: number; batter?: number; extras?: number };
        wickets?: unknown[];
      }>;
    }>;
  }>;
};

type OpenFootballDataset = {
  name?: string;
  season?: string;
  matches?: Array<{
    round?: string;
    date?: string;
    time?: string;
    team1?: string;
    team2?: string;
    score?:
      | {
          ft?: [number, number];
          ht?: [number, number];
        }
      | [number, number];
    goals1?: string[];
    goals2?: string[];
  }>;
};

type OpenFootballScore = NonNullable<NonNullable<OpenFootballDataset["matches"]>[number]["score"]>;

type CricketDataMatch = {
  id?: string;
  name?: string;
  matchType?: string;
  status?: string;
  venue?: string;
  date?: string;
  dateTimeGMT?: string;
  teams?: string[];
  score?: Array<{
    r?: number;
    w?: number;
    o?: number;
    inning?: string;
  }>;
};

type CricketDataResponse = {
  data?: CricketDataMatch[];
};

export function normalizeCricsheetMatch(input: unknown, sourceId = crypto.randomUUID()): NormalizedMatch {
  const match = input as CricsheetMatch;
  const info = match.info ?? {};
  const teams = info.teams ?? [];
  const homeName = teams[0] ?? "Team A";
  const awayName = teams[1] ?? "Team B";
  const matchDate = info.dates?.[0] ? new Date(`${info.dates[0]}T10:00:00.000Z`) : new Date();
  const tournamentName = info.event?.name ?? "Cricket";
  const homeInnings = summarizeCricketInnings(match, homeName);
  const awayInnings = summarizeCricketInnings(match, awayName);
  const title = `${homeName} বনাম ${awayName}`;

  return {
    provider: "cricsheet",
    sourceId,
    sport: { nameBn: "ক্রিকেট", nameEn: "Cricket", slug: "cricket" },
    tournament: {
      nameBn: tournamentName,
      nameEn: tournamentName,
      slug: ensureSlug(null, tournamentName),
      sourceId: `cricsheet:${createBanglaSlug(tournamentName)}`
    },
    season: {
      nameBn: String(matchDate.getUTCFullYear()),
      nameEn: String(matchDate.getUTCFullYear()),
      startsAt: new Date(Date.UTC(matchDate.getUTCFullYear(), 0, 1)),
      endsAt: new Date(Date.UTC(matchDate.getUTCFullYear(), 11, 31)),
      sourceId: `cricsheet:${tournamentName}:${matchDate.getUTCFullYear()}`
    },
    homeTeam: teamFromName(homeName, "cricsheet"),
    awayTeam: teamFromName(awayName, "cricsheet"),
    titleBn: title,
    titleEn: `${homeName} vs ${awayName}`,
    slug: ensureSlug(null, `${title}-${matchDate.toISOString().slice(0, 10)}`),
    status: info.outcome ? "completed" : "scheduled",
    startsAt: matchDate,
    venueBn: info.venue ?? info.city ?? null,
    venueEn: info.venue ?? info.city ?? null,
    homeScore: homeInnings,
    awayScore: awayInnings,
    scoreSummary: info.outcome?.winner ? `${info.outcome.winner} won` : null,
    liveSummary: info.match_type ? `${info.match_type.toUpperCase()} match` : null,
    rawPayload: input
  };
}

export async function normalizeOpenFootballFromUrl(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Sportsfair data importer (admin-triggered; contact site owner)"
    }
  });

  if (!response.ok) {
    throw new Error(`OpenFootball fetch failed: ${response.status}`);
  }

  const data = (await response.json()) as OpenFootballDataset;
  return normalizeOpenFootballDataset(data, url);
}

export function normalizeOpenFootballDataset(dataset: OpenFootballDataset, sourceUrl?: string): NormalizedMatch[] {
  const competitionName = dataset.name ?? "Football";
  const seasonName = dataset.season ?? inferSeasonFromUrl(sourceUrl) ?? String(new Date().getFullYear());

  return (dataset.matches ?? [])
    .filter((match) => match.team1 && match.team2 && match.date)
    .map((match, index) => {
      const startsAt = parseOpenFootballDate(match.date ?? "", match.time);
      const finalScore = openFootballFinalScore(match.score);
      const homeScore = finalScore ? String(finalScore[0] ?? "") : null;
      const awayScore = finalScore ? String(finalScore[1] ?? "") : null;
      const title = `${match.team1} বনাম ${match.team2}`;
      const sourceId = `${sourceUrl ?? competitionName}:${match.date}:${match.team1}:${match.team2}:${index}`;

      return {
        provider: "openfootball",
        sourceId,
        sourceUrl,
        sport: { nameBn: "ফুটবল", nameEn: "Football", slug: "football" },
        tournament: {
          nameBn: competitionName,
          nameEn: competitionName,
          slug: ensureSlug(null, competitionName),
          sourceId: `openfootball:${createBanglaSlug(competitionName)}`
        },
        season: {
          nameBn: seasonName,
          nameEn: seasonName,
          startsAt: new Date(Date.UTC(startsAt.getUTCFullYear(), 0, 1)),
          endsAt: new Date(Date.UTC(startsAt.getUTCFullYear(), 11, 31)),
          sourceId: `openfootball:${competitionName}:${seasonName}`
        },
        homeTeam: teamFromName(match.team1 ?? "Team A", "openfootball"),
        awayTeam: teamFromName(match.team2 ?? "Team B", "openfootball"),
        titleBn: title,
        titleEn: `${match.team1} vs ${match.team2}`,
        slug: ensureSlug(null, `${title}-${startsAt.toISOString().slice(0, 10)}`),
        status: finalScore ? "completed" : "scheduled",
        startsAt,
        homeScore,
        awayScore,
        scoreSummary: finalScore ? `${homeScore}-${awayScore}` : null,
        liveSummary: match.round ?? null,
        rawPayload: match
      } satisfies NormalizedMatch;
    });
}

export async function normalizeCricketDataCurrentMatches(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Sportsfair data importer (configured CricketData sync)"
    }
  });

  if (!response.ok) {
    throw new Error(`CricketData fetch failed: ${response.status}`);
  }

  const data = (await response.json()) as CricketDataResponse;
  return normalizeCricketDataMatches(data.data ?? [], url);
}

export function normalizeCricketDataMatches(items: CricketDataMatch[], sourceUrl?: string): NormalizedMatch[] {
  return items
    .filter((item) => item.id && item.teams?.length === 2)
    .map((item) => {
      const homeName = item.teams?.[0] ?? "Team A";
      const awayName = item.teams?.[1] ?? "Team B";
      const startsAt = parseProviderDate(item.dateTimeGMT || item.date);
      const title = item.name || `${homeName} বনাম ${awayName}`;
      const homeScore = findCricketDataScore(item, homeName);
      const awayScore = findCricketDataScore(item, awayName);

      return {
        provider: "cricketdata",
        sourceId: item.id ?? `${title}:${startsAt.toISOString()}`,
        sourceUrl,
        sport: { nameBn: "ক্রিকেট", nameEn: "Cricket", slug: "cricket" },
        tournament: {
          nameBn: "CricketData",
          nameEn: "CricketData",
          slug: "cricketdata",
          sourceId: "cricketdata:tournament:default"
        },
        season: {
          nameBn: String(startsAt.getUTCFullYear()),
          nameEn: String(startsAt.getUTCFullYear()),
          startsAt: new Date(Date.UTC(startsAt.getUTCFullYear(), 0, 1)),
          endsAt: new Date(Date.UTC(startsAt.getUTCFullYear(), 11, 31)),
          sourceId: `cricketdata:${startsAt.getUTCFullYear()}`
        },
        homeTeam: teamFromName(homeName, "cricketdata"),
        awayTeam: teamFromName(awayName, "cricketdata"),
        titleBn: title,
        titleEn: `${homeName} vs ${awayName}`,
        slug: ensureSlug(null, `${title}-${startsAt.toISOString().slice(0, 10)}`),
        status: inferCricketDataStatus(item.status),
        startsAt,
        venueBn: item.venue ?? null,
        venueEn: item.venue ?? null,
        homeScore,
        awayScore,
        scoreSummary: item.status ?? null,
        liveSummary: item.matchType ? `${item.matchType.toUpperCase()} match` : item.status,
        rawPayload: item
      } satisfies NormalizedMatch;
    });
}

function teamFromName(name: string, provider: "cricsheet" | "openfootball" | "cricketdata") {
  return {
    nameBn: name,
    nameEn: name,
    slug: ensureSlug(null, name),
    sourceId: `${provider}:team:${createBanglaSlug(name)}`
  };
}

function summarizeCricketInnings(match: CricsheetMatch, teamName: string) {
  const innings = match.innings?.filter((entry) => entry.team === teamName) ?? [];

  if (innings.length === 0) {
    return null;
  }

  const parts = innings.map((entry) => {
    let runs = 0;
    let wickets = 0;
    let legalBalls = 0;

    for (const over of entry.overs ?? []) {
      for (const delivery of over.deliveries ?? []) {
        runs += delivery.runs?.total ?? 0;
        wickets += delivery.wickets?.length ?? 0;
        legalBalls += 1;
      }
    }

    const overs = Math.floor(legalBalls / 6);
    const balls = legalBalls % 6;
    return `${runs}/${wickets} (${overs}.${balls})`;
  });

  return parts.join(" & ");
}

function parseOpenFootballDate(date: string, time?: string) {
  const cleanedTime = time?.match(/\d{1,2}:\d{2}/)?.[0];
  const value = cleanedTime ? `${date}T${cleanedTime}:00.000Z` : `${date}T15:00:00.000Z`;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function openFootballFinalScore(score: OpenFootballScore | undefined) {
  if (Array.isArray(score)) {
    return score;
  }

  return Array.isArray(score?.ft) ? score.ft : null;
}

function parseProviderDate(value?: string) {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function inferSeasonFromUrl(url?: string) {
  return url?.match(/(\d{4}-\d{2}|\d{4})/)?.[1] ?? null;
}

function findCricketDataScore(item: CricketDataMatch, teamName: string) {
  const score = item.score?.find((entry) => entry.inning?.toLowerCase().includes(teamName.toLowerCase()));

  if (!score) {
    return null;
  }

  return `${score.r ?? 0}/${score.w ?? 0}${score.o !== undefined ? ` (${score.o})` : ""}`;
}

function inferCricketDataStatus(value?: string): NormalizedMatch["status"] {
  const normalized = value?.toLowerCase() ?? "";

  if (normalized.includes("live") || normalized.includes("innings") || normalized.includes("need")) {
    return "live";
  }

  if (normalized.includes("won") || normalized.includes("draw") || normalized.includes("abandoned")) {
    return "completed";
  }

  if (normalized.includes("postponed")) {
    return "postponed";
  }

  if (normalized.includes("cancel")) {
    return "cancelled";
  }

  return "scheduled";
}
