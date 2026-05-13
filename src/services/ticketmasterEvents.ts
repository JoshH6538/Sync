import axios from "axios";
import Constants from "../Constants";
import {
  TicketmasterAttractionSearchPlan,
  TicketmasterEventSearchPlan,
  TicketmasterRecommendationMetadata,
} from "../types/ticketmaster";
import { CACHE_TTLS, getCachedValue, setCachedValue } from "./cache";
import { resolveTicketmasterAttractions } from "./ticketmasterAttractions";

export const TICKETMASTER_MUSIC_SEGMENT_ID = "KZFzniwnSyZfZ7v7nJ";
const TICKETMASTER_EVENTS_CACHE_VERSION = "v1";
const inFlightEventRequests = new Map<string, Promise<any[]>>();

export type TicketmasterEventSearchSettings = {
  latitude: number;
  longitude: number;
  radius: number;
  unit: string;
  size: number;
  sort: string;
};

export type TicketmasterRawEventWithSource = {
  event: any;
  source: TicketmasterEventSearchPlan["kind"];
  eventSearchPlan: TicketmasterEventSearchPlan;
  recommendationMetadata?: TicketmasterRecommendationMetadata[];
};

export type TicketmasterEventSearchDebugInfo = {
  subGenreIds: string[];
  genreIds: string[];
  attractionIds: string[];
  totalSubGenreIds: number;
  sourceSearchIds: string[];
};

export const searchTicketmasterEvents = async (
  eventSearchPlan: TicketmasterEventSearchPlan,
  apiKey: string,
  settings: TicketmasterEventSearchSettings,
) => {
  const cacheKey = getTicketmasterEventsCacheKey(eventSearchPlan, settings);
  const cachedEvents = getCachedValue<any[]>(cacheKey);

  if (cachedEvents) {
    logTicketmasterEventsCache(`${eventSearchPlan.kind}_hit`, eventSearchPlan);
    return cachedEvents.map((event) => ({
      event,
      source: eventSearchPlan.kind,
      eventSearchPlan,
    }));
  }

  logTicketmasterEventsCache(`${eventSearchPlan.kind}_miss`, eventSearchPlan);

  const events = await getOrCreateEventRequest(
    cacheKey,
    eventSearchPlan,
    apiKey,
    settings,
  );

  return events.map((event) => ({
    event,
    source: eventSearchPlan.kind,
    eventSearchPlan,
  }));
};

const getOrCreateEventRequest = (
  cacheKey: string,
  eventSearchPlan: TicketmasterEventSearchPlan,
  apiKey: string,
  settings: TicketmasterEventSearchSettings,
) => {
  const inFlightRequest = inFlightEventRequests.get(cacheKey);
  if (inFlightRequest) return inFlightRequest;

  const request = fetchTicketmasterEventResults(
    eventSearchPlan,
    apiKey,
    settings,
  )
    .then((events) => {
      setCachedValue(cacheKey, events, CACHE_TTLS.ticketmasterEvents);
      return events;
    })
    .finally(() => {
      inFlightEventRequests.delete(cacheKey);
    });

  inFlightEventRequests.set(cacheKey, request);
  return request;
};

const fetchTicketmasterEventResults = async (
  eventSearchPlan: TicketmasterEventSearchPlan,
  apiKey: string,
  settings: TicketmasterEventSearchSettings,
) => {
  const params = buildTicketmasterEventSearchParams(
    eventSearchPlan,
    apiKey,
    settings,
  );
  const url = `${Constants.EVENTS_BASE_URL.split("?")[0]}?${params.toString()}`;
  const { data } = await axios.get(url);

  return (data?._embedded?.events ?? []) as any[];
};

export const getTicketmasterEventSearchDebugInfo = (
  eventSearchPlan: TicketmasterEventSearchPlan,
): TicketmasterEventSearchDebugInfo => ({
  subGenreIds: eventSearchPlan.subGenreIds,
  genreIds: eventSearchPlan.genreIds,
  attractionIds: eventSearchPlan.attractionIds,
  totalSubGenreIds: eventSearchPlan.subGenreIds.length,
  sourceSearchIds: eventSearchPlan.sourceSearchIds,
});

export const searchEventsForResolvedAttraction = async (
  attractionId: string,
  apiKey: string,
  settings: TicketmasterEventSearchSettings,
) =>
  searchTicketmasterEvents(
    {
      kind: "artist",
      attractionIds: [attractionId],
      genreIds: [],
      subGenreIds: [],
      sourceSearchIds: [`ticketmaster:attraction:${attractionId}`],
      matchedReasons: ["matched_attraction"],
    },
    apiKey,
    settings,
  );

export const resolveArtistAndSearchEvents = async (
  attractionSearch: TicketmasterAttractionSearchPlan,
  apiKey: string,
  settings: TicketmasterEventSearchSettings,
) => {
  const [resolution] = await resolveTicketmasterAttractions([attractionSearch], apiKey);
  if (!resolution?.attractionId) return [];

  return searchEventsForResolvedAttraction(resolution.attractionId, apiKey, settings);
};

const buildTicketmasterEventSearchParams = (
  eventSearchPlan: TicketmasterEventSearchPlan,
  apiKey: string,
  settings: TicketmasterEventSearchSettings,
) => {
  const params = new URLSearchParams({
    apikey: apiKey,
    latlong: `${settings.latitude},${settings.longitude}`,
    radius: String(settings.radius),
    unit: settings.unit,
    segmentId: TICKETMASTER_MUSIC_SEGMENT_ID,
    size: String(settings.size),
    sort: settings.sort,
  });

  eventSearchPlan.attractionIds.forEach((attractionId) => {
    params.append("attractionId", attractionId);
  });
  eventSearchPlan.subGenreIds.forEach((subGenreId) => {
    params.append("subGenreId", subGenreId);
  });
  eventSearchPlan.genreIds.forEach((genreId) => {
    params.append("genreId", genreId);
  });
  if (eventSearchPlan.keyword) {
    params.set("keyword", eventSearchPlan.keyword);
  }

  return params;
};

const getTicketmasterEventsCacheKey = (
  eventSearchPlan: TicketmasterEventSearchPlan,
  settings: TicketmasterEventSearchSettings,
) =>
  [
    "sync:ticketmaster:events",
    TICKETMASTER_EVENTS_CACHE_VERSION,
    eventSearchPlan.kind,
    settings.latitude.toFixed(4),
    settings.longitude.toFixed(4),
    settings.radius,
    settings.unit,
    settings.size,
    settings.sort,
    TICKETMASTER_MUSIC_SEGMENT_ID,
    `attractions:${stableIdList(eventSearchPlan.attractionIds)}`,
    `subgenres:${stableIdList(eventSearchPlan.subGenreIds)}`,
    `genres:${stableIdList(eventSearchPlan.genreIds)}`,
    `keyword:${normalizeCacheText(eventSearchPlan.keyword ?? "")}`,
  ].join("|");

const stableIdList = (ids: string[]) => ids.slice().sort().join(",");

const normalizeCacheText = (value: string) => value.trim().toLowerCase();

const logTicketmasterEventsCache = (
  result:
    | "artist_hit"
    | "artist_miss"
    | "suggested_hit"
    | "suggested_miss",
  eventSearchPlan: TicketmasterEventSearchPlan,
) => {
  if (!import.meta.env.DEV) return;

  const eventName =
    result === "artist_hit"
      ? "ticketmaster_artist_events_cache_hit"
      : result === "artist_miss"
        ? "ticketmaster_artist_events_cache_miss"
        : result === "suggested_hit"
          ? "ticketmaster_suggested_events_cache_hit"
          : "ticketmaster_suggested_events_cache_miss";

  console.debug(eventName, getTicketmasterEventSearchDebugInfo(eventSearchPlan));
};
