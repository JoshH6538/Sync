import type { TicketmasterQueryPlan } from "../../types/ticketmaster";
import type { SpotifyTimeRange, TasteProfile } from "../../types/taste";
import demoSpotifyExport from "./sync-demo-export.json";

export type DemoSpotifyUser = {
  name: string;
  id: string;
  image: string;
  url: string;
};

export type DemoSpotifyDataSource = {
  artistTimeRange: SpotifyTimeRange;
  trackTimeRange: SpotifyTimeRange;
  artistLimit: number;
  trackLimit: number;
};

export type DemoSpotifyRangeData = {
  source: DemoSpotifyDataSource;
  topArtists: unknown[];
  topTracks: unknown[];
  tasteProfile: TasteProfile;
  ticketmasterQueryPlan?: TicketmasterQueryPlan | null;
};

export type DemoSpotifyDataV1 = {
  schemaVersion: 1;
  exportedAt: string;
  source: DemoSpotifyDataSource;
  user: DemoSpotifyUser;
  topArtists: unknown[];
  topTracks: unknown[];
  tasteProfile: TasteProfile;
  ticketmasterQueryPlan?: TicketmasterQueryPlan | null;
};

export type DemoSpotifyDataV2 = {
  schemaVersion: 2;
  exportedAt: string;
  user: DemoSpotifyUser;
  defaultRange: SpotifyTimeRange;
  ranges: Partial<Record<SpotifyTimeRange, DemoSpotifyRangeData>>;
  missingRanges?: SpotifyTimeRange[];
};

export type DemoSpotifyData = DemoSpotifyDataV1 | DemoSpotifyDataV2;

const DEFAULT_DEMO_RANGE: SpotifyTimeRange = "medium_term";

export const demoSpotifyData =
  demoSpotifyExport as unknown as DemoSpotifyData;

export const demoSpotifyUser: DemoSpotifyUser = {
  ...demoSpotifyData.user,
  name: "Guest Listener",
};

export function getDemoSpotifyRangeData(
  range: SpotifyTimeRange,
): DemoSpotifyRangeData {
  if (isDemoSpotifyDataV2(demoSpotifyData)) {
    return (
      demoSpotifyData.ranges[range] ??
      demoSpotifyData.ranges[demoSpotifyData.defaultRange] ??
      getFirstV2Range(demoSpotifyData) ??
      getEmptyDemoRangeData(range)
    );
  }

  return {
    source: demoSpotifyData.source,
    topArtists: demoSpotifyData.topArtists,
    topTracks: demoSpotifyData.topTracks,
    tasteProfile: demoSpotifyData.tasteProfile,
    ticketmasterQueryPlan: demoSpotifyData.ticketmasterQueryPlan ?? null,
  };
}

export function getDemoTopArtists(range: SpotifyTimeRange, count: number) {
  return getDemoSpotifyRangeData(range).topArtists.slice(0, count);
}

export function getDemoTopTracks(range: SpotifyTimeRange, count: number) {
  return getDemoSpotifyRangeData(range).topTracks.slice(0, count);
}

export function getDemoTasteProfile(range: SpotifyTimeRange) {
  return getDemoSpotifyRangeData(range).tasteProfile;
}

export function getDemoTicketmasterQueryPlan(range: SpotifyTimeRange) {
  return getDemoSpotifyRangeData(range).ticketmasterQueryPlan ?? null;
}

export const demoTopArtists = getDemoTopArtists(DEFAULT_DEMO_RANGE, 50);
export const demoTopTracks = getDemoTopTracks(DEFAULT_DEMO_RANGE, 50);
export const demoTasteProfile = getDemoTasteProfile(DEFAULT_DEMO_RANGE);
export const demoTicketmasterQueryPlan =
  getDemoTicketmasterQueryPlan(DEFAULT_DEMO_RANGE);

function isDemoSpotifyDataV2(
  data: DemoSpotifyData,
): data is DemoSpotifyDataV2 {
  return data.schemaVersion === 2;
}

function getFirstV2Range(data: DemoSpotifyDataV2) {
  const firstRange = Object.values(data.ranges)[0];
  return firstRange ?? null;
}

function getEmptyDemoRangeData(range: SpotifyTimeRange): DemoSpotifyRangeData {
  return {
    source: {
      artistTimeRange: range,
      trackTimeRange: range,
      artistLimit: 0,
      trackLimit: 0,
    },
    topArtists: [],
    topTracks: [],
    tasteProfile: {
      generatedAt: "",
      source: {
        provider: "spotify",
        scopes: [],
        artistTimeRange: range,
        trackTimeRange: range,
        artistLimit: 0,
        trackLimit: 0,
      },
      user: {
        id: demoSpotifyData.user.id,
        name: "Guest Listener",
        imageUrl: demoSpotifyData.user.image,
        spotifyUrl: "",
      },
      artists: [],
      tracks: [],
      genres: [],
      subgenres: [],
      broadGenres: [],
      edges: [],
    },
    ticketmasterQueryPlan: null,
  };
}
