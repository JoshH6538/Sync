import axios from "axios";
import Constants from "../Constants";
import { CACHE_TTLS, getCachedValue, setCachedValue } from "./cache";
import {
  TicketmasterAttractionResolution,
  TicketmasterAttractionSearchPlan,
} from "../types/ticketmaster";

const ATTRACTION_CACHE_VERSION = "v1";
const ATTRACTION_SEARCH_SIZE = "5";
const inFlightAttractionRequests = new Map<
  string,
  Promise<TicketmasterAttractionResolution>
>();

type TicketmasterAttractionApiItem = {
  id: string;
  name: string;
  externalLinks?: {
    spotify?: {
      url?: string;
    }[];
  };
  classifications?: {
    segment?: {
      name?: string;
    };
  }[];
};

export const resolveTicketmasterAttractions = async (
  attractionSearches: TicketmasterAttractionSearchPlan[],
  apiKey: string,
) => {
  const resolutions: TicketmasterAttractionResolution[] = [];

  for (const search of attractionSearches) {
    const cached = getCachedAttractionResolution(search);
    if (cached) {
      resolutions.push(cached);
      continue;
    }

    const resolution = await getOrCreateAttractionRequest(search, apiKey);
    cacheAttractionResolution(search, resolution);
    resolutions.push(resolution);
  }

  return resolutions;
};

const getOrCreateAttractionRequest = (
  search: TicketmasterAttractionSearchPlan,
  apiKey: string,
) => {
  const key = getArtistCacheKey(search.artistId);
  const inFlightRequest = inFlightAttractionRequests.get(key);
  if (inFlightRequest) return inFlightRequest;

  const request = fetchAttractionResolution(search, apiKey).finally(() => {
    inFlightAttractionRequests.delete(key);
  });
  inFlightAttractionRequests.set(key, request);
  return request;
};

export const normalizeAttractionName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");

const fetchAttractionResolution = async (
  search: TicketmasterAttractionSearchPlan,
  apiKey: string,
): Promise<TicketmasterAttractionResolution> => {
  const params = new URLSearchParams({
    apikey: apiKey,
    keyword: search.keyword,
    classificationName: "music",
    size: ATTRACTION_SEARCH_SIZE,
  });

  try {
    const { data } = await axios.get(
      `${Constants.ATTRACTIONS_BASE_URL}?${params.toString()}`,
    );
    const attractions = (data?._embedded?.attractions ??
      []) as TicketmasterAttractionApiItem[];
    const match = findConservativeAttractionMatch(search, attractions);

    if (!match) return noMatchResolution(search);

    return {
      spotifyArtistId: search.artistId,
      artistName: search.artistName,
      normalizedArtistName: normalizeAttractionName(search.artistName),
      status: "matched",
      attractionId: match.attraction.id,
      attractionName: match.attraction.name,
      matchType: match.matchType,
    };
  } catch {
    return noMatchResolution(search);
  }
};

const findConservativeAttractionMatch = (
  search: TicketmasterAttractionSearchPlan,
  attractions: TicketmasterAttractionApiItem[],
) => {
  const spotifyIdMatch = attractions.find((attraction) =>
    getSpotifyArtistIdsFromAttraction(attraction).includes(search.artistId),
  );

  if (spotifyIdMatch) {
    return {
      attraction: spotifyIdMatch,
      matchType: "spotify_external_link" as const,
    };
  }

  const artistName = search.artistName;
  const normalizedArtistName = normalizeAttractionName(artistName);
  const musicAttractions = attractions.filter(isMusicAttraction);
  const exactMatch = musicAttractions.find(
    (attraction) => normalizeAttractionName(attraction.name) === normalizedArtistName,
  );

  if (exactMatch) {
    return {
      attraction: exactMatch,
      matchType: "exact" as const,
    };
  }

  const safeNearExactMatch = musicAttractions.find(
    (attraction) =>
      stripCollaborationText(normalizeAttractionName(attraction.name)) ===
      stripCollaborationText(normalizedArtistName),
  );

  if (!safeNearExactMatch) return null;

  return {
    attraction: safeNearExactMatch,
    matchType: "safe_near_exact" as const,
  };
};

const isMusicAttraction = (attraction: TicketmasterAttractionApiItem) =>
  attraction.classifications?.some(
    (classification) => classification.segment?.name?.toLowerCase() === "music",
  ) ?? false;

const stripCollaborationText = (name: string) =>
  name.split(/\s+(feat|ft|with|and)\s+/)[0].trim();

const getSpotifyArtistIdsFromAttraction = (
  attraction: TicketmasterAttractionApiItem,
) =>
  (attraction.externalLinks?.spotify ?? [])
    .map((link) => extractSpotifyArtistId(link.url ?? ""))
    .filter((artistId): artistId is string => !!artistId);

const extractSpotifyArtistId = (url: string) => {
  const match = url.match(/spotify\.com\/artist\/([A-Za-z0-9]+)/);
  return match?.[1];
};

const noMatchResolution = (
  search: TicketmasterAttractionSearchPlan,
): TicketmasterAttractionResolution => ({
  spotifyArtistId: search.artistId,
  artistName: search.artistName,
  normalizedArtistName: normalizeAttractionName(search.artistName),
  status: "no_match",
});

const getCachedAttractionResolution = (search: TicketmasterAttractionSearchPlan) =>
  getCachedValue<TicketmasterAttractionResolution>(getArtistCacheKey(search.artistId)) ??
  getCachedValue<TicketmasterAttractionResolution>(
    getArtistNameCacheKey(search.artistName),
  );

const cacheAttractionResolution = (
  search: TicketmasterAttractionSearchPlan,
  resolution: TicketmasterAttractionResolution,
) => {
  setCachedValue(
    getArtistCacheKey(search.artistId),
    resolution,
    CACHE_TTLS.ticketmasterAttraction,
  );
  setCachedValue(
    getArtistNameCacheKey(search.artistName),
    resolution,
    CACHE_TTLS.ticketmasterAttraction,
  );
};

const getArtistCacheKey = (spotifyArtistId: string) =>
  `sync:ticketmaster:attraction:${spotifyArtistId}:${ATTRACTION_CACHE_VERSION}`;

const getArtistNameCacheKey = (artistName: string) =>
  `sync:ticketmaster:attraction-name:${normalizeAttractionName(
    artistName,
  )}:${ATTRACTION_CACHE_VERSION}`;
