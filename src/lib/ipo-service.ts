import { IPO } from "./db/schema";
import { sampleIPOs } from "./ipo-data";

// ==========================================
// Types for Finnhub API response (US)
// ==========================================

interface FinnhubIPO {
  date: string;
  exchange: string;
  name: string;
  numberOfShares: number;
  price: string;
  status: string;
  symbol: string;
  totalSharesValue: number;
}

interface FinnhubIPOCalendarResponse {
  ipoCalendar: FinnhubIPO[];
}

// ==========================================
// Types for IPOAlerts API response (India)
// ==========================================

interface IPOAlertsResponse {
  ipos: IPOAlertsIPO[];
  meta?: {
    count: number;
    countOnPage: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

interface IPOAlertsIPO {
  id: string;
  name: string;
  slug: string;
  type: "EQ" | "SME" | "DEBT";
  status: string;
  startDate: string | null;
  endDate: string | null;
  listingDate: string | null;
  priceRange: string | null;
  minQty: number | null;
  minAmount: number | null;
  issueSize: string | null;
  logo: string | null;
  about: string | null;
  schedule?: { date: string; event: string }[];
  listingGain?: string | null;
}

// ==========================================
// Persistent + in-memory cache
// ==========================================

import * as fs from "fs";
import * as path from "path";

const isVercel = !!process.env.VERCEL;

interface CacheEntry {
  data: Partial<IPO>[];
  timestamp: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const cache = new Map<string, CacheEntry>();
const CACHE_DIR = path.join(process.cwd(), ".cache");

function getCached(key: string): Partial<IPO>[] | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp <= CACHE_TTL_MS) {
    return entry.data;
  }
  return null;
}

function getStaleCached(key: string): Partial<IPO>[] | null {
  const entry = cache.get(key);
  if (entry) return entry.data;

  // File cache skipped on Vercel (serverless has read-only filesystem)
  if (isVercel) return null;
  try {
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed: CacheEntry = JSON.parse(raw);
      cache.set(key, parsed);
      return parsed.data;
    }
  } catch {
    // Ignore
  }
  return null;
}

function setCache(key: string, data: Partial<IPO>[]): void {
  const entry: CacheEntry = { data, timestamp: Date.now() };
  cache.set(key, entry);

  if (!isVercel) {
    try {
      if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
      fs.writeFileSync(path.join(CACHE_DIR, `${key}.json`), JSON.stringify(entry), "utf-8");
    } catch {
      // Ignore
    }
  }
}

// ==========================================
// Helpers
// ==========================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ==========================================
// IPOAlerts.in API integration (India)
// ==========================================

function mapIPOAlertsStatus(status: string): string {
  const s = status?.toLowerCase() || "";
  if (s === "open" || s === "bidding") return "open";
  if (s === "upcoming" || s === "announced") return "upcoming";
  if (s === "listed" || s === "allotted" || s === "closed") return "listed";
  return "upcoming";
}

function mapIPOAlertsToIPO(item: IPOAlertsIPO): Partial<IPO> {
  const slug = item.slug || generateSlug(item.name);
  const mappedStatus = mapIPOAlertsStatus(item.status);

  // Parse price range like "95-100" or "₹95 - ₹100"
  let priceMin: string | undefined;
  let priceMax: string | undefined;
  if (item.priceRange) {
    const cleaned = item.priceRange.replace(/[₹,\s]/g, "");
    const parts = cleaned.split("-");
    if (parts.length === 2) {
      priceMin = parts[0].trim();
      priceMax = parts[1].trim();
    } else if (parts.length === 1) {
      priceMin = parts[0].trim();
      priceMax = parts[0].trim();
    }
  }

  // Parse issue size
  let issueSize: string | undefined;
  if (item.issueSize) {
    issueSize = item.issueSize;
  } else if (item.minAmount && item.minQty) {
    // Estimate from minAmount
    issueSize = `₹${item.minAmount.toLocaleString("en-IN")}`;
  }

  // Find allotment date from schedule
  let allotmentDate: Date | undefined;
  if (item.schedule) {
    const allotmentEntry = item.schedule.find(
      (s) =>
        s.event.toLowerCase().includes("allotment") ||
        s.event.toLowerCase().includes("basis of allotment")
    );
    if (allotmentEntry) {
      allotmentDate = new Date(allotmentEntry.date);
    }
  }

  // Parse listing gain for listing price
  let listingPrice: string | undefined;
  if (item.listingGain && priceMax) {
    const gainMatch = item.listingGain.match(/([-+]?\d+\.?\d*)%/);
    if (gainMatch) {
      const gainPct = parseFloat(gainMatch[1]);
      const maxPrice = parseFloat(priceMax);
      if (!isNaN(gainPct) && !isNaN(maxPrice)) {
        listingPrice = (maxPrice * (1 + gainPct / 100)).toFixed(2);
      }
    }
  }

  const exchange =
    item.type === "SME" ? "NSE SME" : item.type === "DEBT" ? "NSE" : "NSE/BSE";

  return {
    id: `ipoalerts-${item.id}`,
    name: item.name,
    slug,
    market: "india",
    exchange,
    status: mappedStatus,
    priceMin,
    priceMax,
    listingPrice,
    lotSize: item.minQty || undefined,
    issueSize,
    openDate: item.startDate ? new Date(item.startDate) : undefined,
    closeDate: item.endDate ? new Date(item.endDate) : undefined,
    allotmentDate,
    listingDate: item.listingDate ? new Date(item.listingDate) : undefined,
    description: item.about || `${item.name} IPO on ${exchange}.`,
    sector: item.type === "SME" ? "SME" : undefined,
  };
}

async function fetchFromIPOAlerts(): Promise<Partial<IPO>[]> {
  const apiKey = process.env.IPOALERTS_API_KEY;
  if (!apiKey) {
    return [];
  }

  try {
    // Free tier only supports status=open and returns 1 IPO per page.
    // We need to paginate through all pages to get all open IPOs.
    const allIPOs: Partial<IPO>[] = [];

    // First request to get total page count
    const firstUrl = `https://api.ipoalerts.in/ipos?status=open&page=1`;
    const firstResponse = await fetch(firstUrl, {
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
      },
    });

    if (!firstResponse.ok) {
      console.error(
        `IPOAlerts API error: ${firstResponse.status} ${firstResponse.statusText}`
      );
      return [];
    }

    const firstData: IPOAlertsResponse = await firstResponse.json();

    if (firstData.ipos && Array.isArray(firstData.ipos)) {
      const mapped = firstData.ipos
        .filter((item) => item.name && item.name.trim() !== "")
        .map(mapIPOAlertsToIPO);
      allIPOs.push(...mapped);
    }

    // Fetch remaining pages (free tier: 1 IPO per page, up to 25 requests/day)
    const totalPages = firstData.meta?.totalPages || 1;
    const pagesToFetch = Math.min(totalPages, 10); // Cap at 10 to conserve 25 req/day limit

    for (let page = 2; page <= pagesToFetch; page++) {
      const url = `https://api.ipoalerts.in/ipos?status=open&page=${page}`;

      const response = await fetch(url, {
        headers: {
          "x-api-key": apiKey,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        console.error(
          `IPOAlerts API error page ${page}: ${response.status}`
        );
        break; // Stop if we hit rate limit or error
      }

      const data: IPOAlertsResponse = await response.json();

      if (data.ipos && Array.isArray(data.ipos)) {
        const mapped = data.ipos
          .filter((item) => item.name && item.name.trim() !== "")
          .map(mapIPOAlertsToIPO);
        allIPOs.push(...mapped);
      }
    }

    // Deduplicate by slug
    const seen = new Set<string>();
    return allIPOs.filter((ipo) => {
      if (seen.has(ipo.slug!)) return false;
      seen.add(ipo.slug!);
      return true;
    });
  } catch (error) {
    console.error("Failed to fetch from IPOAlerts:", error);
    return [];
  }
}

// ==========================================
// Finnhub API integration (US)
// ==========================================

function mapFinnhubStatus(status: string): string {
  const normalized = status?.toLowerCase() || "";
  if (
    normalized === "priced" ||
    normalized === "listed" ||
    normalized === "withdrawn"
  ) {
    return "listed";
  }
  if (normalized === "expected" || normalized === "filed") {
    return "upcoming";
  }
  return "upcoming";
}

function mapFinnhubToIPO(item: FinnhubIPO): Partial<IPO> {
  const slug = generateSlug(item.name);
  const mappedStatus = mapFinnhubStatus(item.status);

  let priceMin: string | undefined;
  let priceMax: string | undefined;
  if (item.price) {
    const priceParts = item.price.split("-");
    if (priceParts.length === 2) {
      priceMin = priceParts[0].trim();
      priceMax = priceParts[1].trim();
    } else {
      priceMin = item.price;
      priceMax = item.price;
    }
  }

  let issueSize: string | undefined;
  if (item.totalSharesValue) {
    if (item.totalSharesValue >= 1_000_000_000) {
      issueSize = `$${(item.totalSharesValue / 1_000_000_000).toFixed(1)}B`;
    } else if (item.totalSharesValue >= 1_000_000) {
      issueSize = `$${(item.totalSharesValue / 1_000_000).toFixed(0)}M`;
    } else {
      issueSize = `$${item.totalSharesValue.toLocaleString()}`;
    }
  }

  const ipoDate = item.date ? new Date(item.date) : undefined;

  return {
    id: `finnhub-${slug}`,
    name: item.name,
    slug,
    market: "us",
    exchange: item.exchange || "NASDAQ",
    status: mappedStatus,
    priceMin,
    priceMax,
    listingPrice: mappedStatus === "listed" ? priceMax : undefined,
    issueSize,
    openDate: ipoDate,
    listingDate: mappedStatus === "listed" ? ipoDate : undefined,
    description: `${item.name} (${item.symbol || "N/A"}) IPO on ${item.exchange || "US exchange"}.`,
    sector: "N/A",
  };
}

async function fetchFromFinnhub(): Promise<Partial<IPO>[]> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return [];
  }

  const now = new Date();
  const year = now.getFullYear();
  const fromDate = `${year}-01-01`;
  const toDate = `${year}-12-31`;

  const url = `https://finnhub.io/api/v1/calendar/ipo?from=${fromDate}&to=${toDate}&token=${apiKey}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error(
        `Finnhub API error: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const data: FinnhubIPOCalendarResponse = await response.json();

    if (!data.ipoCalendar || !Array.isArray(data.ipoCalendar)) {
      console.error("Finnhub returned unexpected data format");
      return [];
    }

    return data.ipoCalendar
      .filter((item) => item.name && item.name.trim() !== "")
      .map(mapFinnhubToIPO);
  } catch (error) {
    console.error("Failed to fetch from Finnhub:", error);
    return [];
  }
}

// ==========================================
// Merge & deduplicate logic
// ==========================================

function mergeIPOs(
  sampleData: Partial<IPO>[],
  apiData: Partial<IPO>[]
): Partial<IPO>[] {
  if (apiData.length === 0) return sampleData;

  // Build a set of slugs from sample data for deduplication
  const sampleSlugs = new Set(sampleData.map((ipo) => ipo.slug));

  // Only add API IPOs that don't already exist in sample data
  const newFromApi = apiData.filter((ipo) => !sampleSlugs.has(ipo.slug));

  return [...sampleData, ...newFromApi];
}

// ==========================================
// Public API
// ==========================================

function sortIPOs(ipos: Partial<IPO>[]): Partial<IPO>[] {
  return ipos.sort((a, b) => {
    const statusOrder: Record<string, number> = {
      open: 0,
      upcoming: 1,
      listed: 2,
    };
    const orderA = statusOrder[a.status || "listed"] ?? 3;
    const orderB = statusOrder[b.status || "listed"] ?? 3;
    if (orderA !== orderB) return orderA - orderB;
    const dateA = a.openDate ? new Date(a.openDate).getTime() : 0;
    const dateB = b.openDate ? new Date(b.openDate).getTime() : 0;
    return dateB - dateA;
  });
}

export async function fetchIPOs(
  market: "india" | "us"
): Promise<Partial<IPO>[]> {
  const cacheKey = `ipos-${market}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const sampleData = sampleIPOs.filter((ipo) => ipo.market === market);

  if (market === "india") {
    const apiData = await fetchFromIPOAlerts();
    if (apiData.length === 0) {
      // API failed or rate-limited — use stale cache if available
      const stale = getStaleCached(cacheKey);
      if (stale) return stale;
    }
    const merged = sortIPOs(mergeIPOs(sampleData, apiData));
    setCache(cacheKey, merged);
    return merged;
  }

  if (market === "us") {
    const apiData = await fetchFromFinnhub();
    if (apiData.length === 0) {
      const stale = getStaleCached(cacheKey);
      if (stale) return stale;
    }
    const merged = mergeIPOs(sampleData, apiData);
    setCache(cacheKey, merged);
    return merged;
  }

  setCache(cacheKey, sampleData);
  return sampleData;
}

export async function fetchIPOBySlug(
  market: "india" | "us",
  slug: string
): Promise<Partial<IPO> | null> {
  const allIPOs = await fetchIPOs(market);
  return allIPOs.find((ipo) => ipo.slug === slug) || null;
}

export async function fetchIPOsByStatus(
  market: "india" | "us",
  status: string
): Promise<Partial<IPO>[]> {
  const cacheKey = `ipos-${market}-${status}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const allIPOs = await fetchIPOs(market);
  const filtered = allIPOs.filter((ipo) => ipo.status === status);
  setCache(cacheKey, filtered);
  return filtered;
}
