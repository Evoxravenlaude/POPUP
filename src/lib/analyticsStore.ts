import { supabase } from "@/lib/db";

export type PopupAnalyticsSnapshot = {
  dailyVisits: Record<string, number>;
  artistViews: Record<string, number>;
  dropViews: Record<string, number>;
  productViews: Record<string, number>;
};

const STORAGE_KEY = "popup_analytics_v1";

const EMPTY_ANALYTICS: PopupAnalyticsSnapshot = {
  dailyVisits: {},
  artistViews: {},
  dropViews: {},
  productViews: {},
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadAnalytics(): PopupAnalyticsSnapshot {
  if (typeof window === "undefined") return EMPTY_ANALYTICS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_ANALYTICS;
    const parsed = JSON.parse(raw) as Partial<PopupAnalyticsSnapshot>;
    return {
      dailyVisits: parsed.dailyVisits ?? {},
      artistViews: parsed.artistViews ?? {},
      dropViews: parsed.dropViews ?? {},
      productViews: parsed.productViews ?? {},
    };
  } catch {
    return EMPTY_ANALYTICS;
  }
}

function saveAnalytics(snapshot: PopupAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  // Buffer writes in memory and flush after 2s of quiet — avoids sync
  // localStorage I/O (which blocks the main thread) on every navigation.
  _analyticsBuffer = snapshot;
  if (_flushTimer !== null) clearTimeout(_flushTimer);
  _flushTimer = setTimeout(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(_analyticsBuffer));
    } catch { /* ignore storage quota errors */ }
    _flushTimer = null;
  }, 2000);
}

let _analyticsBuffer: PopupAnalyticsSnapshot | null = null;
let _flushTimer: ReturnType<typeof setTimeout> | null = null;

function incrementRecord(record: Record<string, number>, key: string) {
  return {
    ...record,
    [key]: (record[key] ?? 0) + 1,
  };
}

function incrementDailyVisit() {
  const snapshot = loadAnalytics();
  snapshot.dailyVisits = incrementRecord(snapshot.dailyVisits, todayKey());
  saveAnalytics(snapshot);
}

// Track page visits in Supabase analytics table
async function trackToSupabase(page: string, artistId?: string) {
  try {
    const { error } = await supabase
      .from("analytics")
      .insert({
        page,
        artist_id: artistId || null,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error("Failed to track analytics to Supabase:", error.message);
    }
  } catch (error) {
    console.error("Error tracking analytics:", error);
    // Silently fail to avoid disrupting the app
  }
}

export function recordPageVisit() {
  incrementDailyVisit();
  trackToSupabase("page_visit");
}

export function recordArtistView(artistId: string) {
  const snapshot = loadAnalytics();
  snapshot.dailyVisits = incrementRecord(snapshot.dailyVisits, todayKey());
  snapshot.artistViews = incrementRecord(snapshot.artistViews, artistId);
  saveAnalytics(snapshot);
  trackToSupabase("artist_view", artistId);
}

export function recordDropView(dropId: string) {
  const snapshot = loadAnalytics();
  snapshot.dailyVisits = incrementRecord(snapshot.dailyVisits, todayKey());
  snapshot.dropViews = incrementRecord(snapshot.dropViews, dropId);
  saveAnalytics(snapshot);
  trackToSupabase("drop_view");
}

export function recordProductView(productId: string) {
  const snapshot = loadAnalytics();
  snapshot.dailyVisits = incrementRecord(snapshot.dailyVisits, todayKey());
  snapshot.productViews = incrementRecord(snapshot.productViews, productId);
  saveAnalytics(snapshot);
  trackToSupabase("product_view");
}

export function getAnalyticsSnapshot() {
  return loadAnalytics();
}

export function getRecentVisitSeries(days = 14) {
  const snapshot = loadAnalytics();
  const series: { date: string; visits: number }[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const key = date.toISOString().slice(0, 10);
    series.push({
      date: key,
      visits: snapshot.dailyVisits[key] ?? 0,
    });
  }

  return series;
}

// ── User Engagement Tracking (per wallet) ──────
const ENGAGEMENT_KEY = "popup_engagement_v1";

interface UserEngagement {
  collectionViews: number;
  poapsViews: number;
  subscriptionsViews: number;
  poapsClaimed: number;
  poapsRedeemed: number;
  articlesViewed: Record<string, number>;
  campaignsInteracted: Record<string, number>;
  lastUpdated: number;
}

function getDefaultEngagement(): UserEngagement {
  return {
    collectionViews: 0,
    poapsViews: 0,
    subscriptionsViews: 0,
    poapsClaimed: 0,
    poapsRedeemed: 0,
    articlesViewed: {},
    campaignsInteracted: {},
    lastUpdated: Date.now(),
  };
}

export function getUserEngagement(walletAddress: string): UserEngagement {
  if (typeof window === "undefined") return getDefaultEngagement();

  try {
    const key = `${ENGAGEMENT_KEY}_${walletAddress.toLowerCase()}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : getDefaultEngagement();
  } catch (error) {
    console.error("Error reading engagement:", error);
    return getDefaultEngagement();
  }
}

function saveUserEngagement(walletAddress: string, engagement: UserEngagement) {
  if (typeof window === "undefined") return;

  try {
    const key = `${ENGAGEMENT_KEY}_${walletAddress.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(engagement));
  } catch (error) {
    console.error("Error saving engagement:", error);
  }
}

export function trackCollectionView(walletAddress: string): void {
  const engagement = getUserEngagement(walletAddress);
  engagement.collectionViews += 1;
  engagement.lastUpdated = Date.now();
  saveUserEngagement(walletAddress, engagement);
  recordPageVisit(); // Also record global visit
}

export function trackPOAPsView(walletAddress: string): void {
  const engagement = getUserEngagement(walletAddress);
  engagement.poapsViews += 1;
  engagement.lastUpdated = Date.now();
  saveUserEngagement(walletAddress, engagement);
  recordPageVisit();
}

export function trackSubscriptionsView(walletAddress: string): void {
  const engagement = getUserEngagement(walletAddress);
  engagement.subscriptionsViews += 1;
  engagement.lastUpdated = Date.now();
  saveUserEngagement(walletAddress, engagement);
  recordPageVisit();
}

export function trackPOAPClaimed(walletAddress: string): void {
  const engagement = getUserEngagement(walletAddress);
  engagement.poapsClaimed += 1;
  engagement.lastUpdated = Date.now();
  saveUserEngagement(walletAddress, engagement);
}

export function trackPOAPRedeemed(walletAddress: string): void {
  const engagement = getUserEngagement(walletAddress);
  engagement.poapsRedeemed += 1;
  engagement.lastUpdated = Date.now();
  saveUserEngagement(walletAddress, engagement);
}

export function trackArticleView(walletAddress: string, articleId: string): void {
  const engagement = getUserEngagement(walletAddress);
  engagement.articlesViewed[articleId] = (engagement.articlesViewed[articleId] || 0) + 1;
  engagement.lastUpdated = Date.now();
  saveUserEngagement(walletAddress, engagement);
}

export function trackCampaignInteraction(walletAddress: string, campaignId: string): void {
  const engagement = getUserEngagement(walletAddress);
  engagement.campaignsInteracted[campaignId] = (engagement.campaignsInteracted[campaignId] || 0) + 1;
  engagement.lastUpdated = Date.now();
  saveUserEngagement(walletAddress, engagement);
}
