export type FreeSportsProvider = "manual" | "cricsheet" | "openfootball" | "thesportsdb" | "cricketdata";

export type NormalizedMatch = {
  provider: FreeSportsProvider;
  sourceId: string;
  sourceUrl?: string | null;
  sport: {
    nameBn: string;
    nameEn: string;
    slug: string;
  };
  tournament?: {
    nameBn: string;
    nameEn?: string | null;
    slug: string;
    sourceId?: string | null;
  };
  season?: {
    nameBn: string;
    nameEn?: string | null;
    startsAt?: Date | null;
    endsAt?: Date | null;
    sourceId?: string | null;
  };
  homeTeam: {
    nameBn: string;
    nameEn?: string | null;
    slug: string;
    country?: string | null;
    sourceId?: string | null;
  };
  awayTeam: {
    nameBn: string;
    nameEn?: string | null;
    slug: string;
    country?: string | null;
    sourceId?: string | null;
  };
  titleBn: string;
  titleEn?: string | null;
  slug: string;
  status: "scheduled" | "live" | "completed" | "postponed" | "cancelled";
  startsAt: Date;
  venueBn?: string | null;
  venueEn?: string | null;
  homeScore?: string | null;
  awayScore?: string | null;
  scoreSummary?: string | null;
  liveSummary?: string | null;
  rawPayload?: unknown;
};

export type ImportSummary = {
  imported: number;
  skipped: number;
  provider: FreeSportsProvider;
};
