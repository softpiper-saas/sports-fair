import AdmZip from "adm-zip";
import {
  normalizeCricketDataCurrentMatches,
  normalizeCricsheetMatch,
  normalizeOpenFootballFromUrl
} from "@/lib/sports/free-providers";
import { importNormalizedMatches } from "@/lib/sports/importer";

type SyncResult = {
  provider: string;
  imported: number;
  skipped: number;
  error?: string;
};

const archiveIntervalMs = secondsFromEnv("SPORTS_SYNC_ARCHIVE_INTERVAL_SECONDS", 24 * 60 * 60) * 1000;
const nearLiveIntervalMs = secondsFromEnv("SPORTS_SYNC_NEAR_LIVE_INTERVAL_SECONDS", 60 * 60) * 1000;
const cricsheetZipLimit = secondsFromEnv("SPORTS_SYNC_CRICSHEET_ZIP_MATCH_LIMIT", 100);
const workerMode = process.argv.includes("--worker");

async function main() {
  if (workerMode) {
    await runWorker();
    return;
  }

  const results = await runAllSyncs();
  printResults(results);
}

async function runWorker() {
  console.log("Sports sync worker started.");
  console.log(`Archive interval: ${archiveIntervalMs / 1000}s`);
  console.log(`Near-live interval: ${nearLiveIntervalMs / 1000}s`);
  console.log(`OpenFootball sources: ${listFromEnv("SPORTS_SYNC_OPENFOOTBALL_URLS").length}`);
  console.log(`Cricsheet sources: ${listFromEnv("SPORTS_SYNC_CRICSHEET_JSON_URLS").length}`);
  console.log(`CricketData configured: ${Boolean(cricketDataUrl())}`);

  let lastArchiveRun = 0;
  let lastNearLiveRun = 0;

  while (true) {
    const now = Date.now();

    if (now - lastArchiveRun >= archiveIntervalMs) {
      lastArchiveRun = now;
      printResults(await safeRun(runArchiveSyncs));
    }

    if (now - lastNearLiveRun >= nearLiveIntervalMs) {
      lastNearLiveRun = now;
      printResults(await safeRun(runNearLiveSyncs));
    }

    await sleep(30_000);
  }
}

async function runAllSyncs() {
  const [archive, nearLive] = await Promise.all([runArchiveSyncs(), runNearLiveSyncs()]);
  return [...archive, ...nearLive];
}

async function runArchiveSyncs() {
  const results: SyncResult[] = [];

  for (const url of listFromEnv("SPORTS_SYNC_OPENFOOTBALL_URLS")) {
    try {
      const matches = await normalizeOpenFootballFromUrl(url);
      const result = await importNormalizedMatches(matches);
      results.push({ provider: `openfootball:${url}`, imported: result.imported, skipped: result.skipped });
    } catch (error) {
      results.push({ provider: `openfootball:${url}`, imported: 0, skipped: 0, error: errorMessage(error) });
    }
  }

  for (const url of listFromEnv("SPORTS_SYNC_CRICSHEET_JSON_URLS")) {
    try {
      const result = url.endsWith(".zip") ? await importCricsheetZip(url) : await importCricsheetJson(url);
      results.push({ provider: `cricsheet:${url}`, imported: result.imported, skipped: result.skipped });
    } catch (error) {
      results.push({ provider: `cricsheet:${url}`, imported: 0, skipped: 0, error: errorMessage(error) });
    }
  }

  return results;
}

async function importCricsheetJson(url: string) {
  const response = await fetch(url, {
    headers: { "user-agent": "Sportsfair Cricsheet sync worker" }
  });

  if (!response.ok) {
    throw new Error(`Cricsheet fetch failed for ${url}: ${response.status}`);
  }

  const payload = await response.json();
  const sourceId = cricsheetSourceIdFromUrl(url);
  return importNormalizedMatches([normalizeCricsheetMatch(payload, sourceId)]);
}

async function importCricsheetZip(url: string) {
  const response = await fetch(url, {
    headers: { "user-agent": "Sportsfair Cricsheet sync worker" }
  });

  if (!response.ok) {
    throw new Error(`Cricsheet ZIP fetch failed for ${url}: ${response.status}`);
  }

  const zip = new AdmZip(Buffer.from(await response.arrayBuffer()));
  const entries = zip
    .getEntries()
    .filter((entry) => !entry.isDirectory && entry.entryName.endsWith(".json"))
    .slice(0, cricsheetZipLimit);
  const matches = entries.map((entry) => {
    const sourceId = entry.entryName.split("/").pop()?.replace(/\.json$/i, "") ?? entry.entryName;
    return normalizeCricsheetMatch(JSON.parse(entry.getData().toString("utf8")), sourceId);
  });

  return importNormalizedMatches(matches);
}

async function runNearLiveSyncs() {
  const url = cricketDataUrl();

  if (!url) {
    return [];
  }

  try {
    const matches = await normalizeCricketDataCurrentMatches(url);
    const result = await importNormalizedMatches(matches);
    return [{ provider: "cricketdata", imported: result.imported, skipped: result.skipped }];
  } catch (error) {
    return [{ provider: "cricketdata", imported: 0, skipped: 0, error: errorMessage(error) }];
  }
}

function cricketDataUrl() {
  if (process.env.CRICKETDATA_CURRENT_MATCHES_URL) {
    return process.env.CRICKETDATA_CURRENT_MATCHES_URL;
  }

  if (process.env.CRICKETDATA_API_KEY) {
    return `https://api.cricapi.com/v1/currentMatches?apikey=${encodeURIComponent(process.env.CRICKETDATA_API_KEY)}&offset=0`;
  }

  return null;
}

function listFromEnv(key: string) {
  return (process.env[key] ?? "")
    .split(/[\n,]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function secondsFromEnv(key: string, fallback: number) {
  const value = Number.parseInt(process.env[key] ?? "", 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function cricsheetSourceIdFromUrl(url: string) {
  return url.split("/").pop()?.replace(/\.json$/i, "") || url;
}

function printResults(results: SyncResult[]) {
  if (results.length === 0) {
    console.log("Sports sync: no configured sources to sync.");
    return;
  }

  for (const result of results) {
    if (result.error) {
      console.error(`Sports sync ${result.provider}: failed=${result.error}`);
    } else {
      console.log(`Sports sync ${result.provider}: imported=${result.imported} skipped=${result.skipped}`);
    }
  }
}

async function safeRun(fn: () => Promise<SyncResult[]>) {
  try {
    return await fn();
  } catch (error) {
    return [{ provider: "sports-sync", imported: 0, skipped: 0, error: errorMessage(error) }];
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
