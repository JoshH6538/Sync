import axios from "axios";
import Constants from "../Constants";
import { TicketmasterAttractionSearchPlan, TicketmasterEventSearchPlan } from "../types/ticketmaster";
import { resolveTicketmasterAttractions } from "./ticketmasterAttractions";

export const TICKETMASTER_MUSIC_SEGMENT_ID = "KZFzniwnSyZfZ7v7nJ";

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
  const params = buildTicketmasterEventSearchParams(
    eventSearchPlan,
    apiKey,
    settings,
  );
  const url = `${Constants.EVENTS_BASE_URL.split("?")[0]}?${params.toString()}`;
  const { data } = await axios.get(url);

  return ((data?._embedded?.events ?? []) as any[]).map((event) => ({
    event,
    source: eventSearchPlan.kind,
  }));
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
