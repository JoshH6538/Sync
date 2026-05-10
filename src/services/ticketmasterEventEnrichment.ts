import LocalEvent from "../LocalEventClass";
import LocalVenue from "../LocalVenueClass";
import {
  TicketmasterAttractionResolution,
  TicketmasterQueryPlan,
  TicketmasterRecommendationMetadata,
} from "../types/ticketmaster";
import { TicketmasterRawEventWithSource } from "./ticketmasterEvents";

type TicketmasterEventClassification = {
  genre?: { id?: string; name?: string };
  subGenre?: { id?: string; name?: string };
};

type TicketmasterEventAttraction = {
  id?: string;
  name?: string;
};

export const enrichTicketmasterEvents = (
  events: TicketmasterRawEventWithSource[],
  queryPlan: TicketmasterQueryPlan,
  attractionResolutions: TicketmasterAttractionResolution[],
) =>
  events.map((eventWithSource) => ({
    ...eventWithSource,
    recommendationMetadata: [
      buildRecommendationMetadata(
        eventWithSource,
        queryPlan,
        attractionResolutions,
      ),
    ],
  }));

export const dedupeTicketmasterEvents = (
  events: TicketmasterRawEventWithSource[],
) => {
  const eventsById = new Map<string, TicketmasterRawEventWithSource>();

  events.forEach((eventWithSource) => {
    const existing = eventsById.get(eventWithSource.event.id);
    if (!existing) {
      eventsById.set(eventWithSource.event.id, eventWithSource);
      return;
    }

    eventsById.set(eventWithSource.event.id, {
      ...existing,
      recommendationMetadata: mergeRecommendationMetadata(
        existing.recommendationMetadata ?? [],
        eventWithSource.recommendationMetadata ?? [],
      ),
    });
  });

  return Array.from(eventsById.values());
};

export const mapTicketmasterEventsToLocalEvents = (
  events: TicketmasterRawEventWithSource[],
) =>
  events.map(({ event, recommendationMetadata }) => {
    const venue = new LocalVenue(
      event._embedded.venues[0].name,
      Number(event._embedded.venues[0].location.latitude),
      Number(event._embedded.venues[0].location.longitude),
    );
    return new LocalEvent(
      event.name,
      event.id,
      event.images[0].url,
      venue,
      event.distance,
      event.url,
      recommendationMetadata,
    );
  });

const buildRecommendationMetadata = (
  eventWithSource: TicketmasterRawEventWithSource,
  queryPlan: TicketmasterQueryPlan,
  attractionResolutions: TicketmasterAttractionResolution[],
): TicketmasterRecommendationMetadata => {
  if (eventWithSource.source === "artist") {
    const matchedAttraction = findMatchedAttraction(
      eventWithSource.event._embedded?.attractions ?? [],
      attractionResolutions,
      eventWithSource.eventSearchPlan.attractionIds,
    );

    return {
      recommendationLane: "artist",
      matchedArtistName: matchedAttraction?.artistName,
      matchedSpotifyArtistId: matchedAttraction?.spotifyArtistId,
      attractionId: matchedAttraction?.attractionId,
      sourceSpotifyGenreNames: [],
      matchedTicketmasterSubGenreIds: [],
      matchedTicketmasterSubGenreNames: [],
      recommendationReasons: ["Favorite artist match"],
    };
  }

  const sourceSpotifyGenreNames = getSuggestedSourceSpotifyGenreNames(
    eventWithSource.eventSearchPlan.sourceSearchIds,
    queryPlan,
  );
  const matchedSubgenres = getMatchedEventSubgenres(
    eventWithSource.event.classifications ?? [],
    eventWithSource.eventSearchPlan.subGenreIds,
  );

  return {
    recommendationLane: "suggested",
    sourceSpotifyGenreNames,
    matchedTicketmasterSubGenreIds: matchedSubgenres.map((subgenre) => subgenre.id),
    matchedTicketmasterSubGenreNames: matchedSubgenres
      .map((subgenre) => subgenre.name)
      .filter((name): name is string => !!name),
    recommendationReasons: sourceSpotifyGenreNames.map(
      (name) => `Mapped from your Spotify genre: ${name}`,
    ),
  };
};

const findMatchedAttraction = (
  eventAttractions: TicketmasterEventAttraction[],
  attractionResolutions: TicketmasterAttractionResolution[],
  attractionIds: string[],
) => {
  const eventAttractionIds = new Set(
    eventAttractions.map((attraction) => attraction.id).filter(Boolean),
  );
  return attractionResolutions.find(
    (resolution) =>
      resolution.status === "matched" &&
      resolution.attractionId &&
      attractionIds.includes(resolution.attractionId) &&
      eventAttractionIds.has(resolution.attractionId),
  );
};

const getSuggestedSourceSpotifyGenreNames = (
  sourceSearchIds: string[],
  queryPlan: TicketmasterQueryPlan,
) =>
  unique([
    ...queryPlan.suggestedSubgenreSearches
      .filter((search) => sourceSearchIds.includes(search.id))
      .map((search) => search.sourceGenreName),
    ...queryPlan.classificationSearches
      .filter((search) => sourceSearchIds.includes(search.id))
      .flatMap((search) => search.sourceGenreNames),
    ...queryPlan.keywordSearches
      .filter((search) => sourceSearchIds.includes(search.id))
      .map((search) => search.sourceName),
  ]);

const getMatchedEventSubgenres = (
  classifications: TicketmasterEventClassification[],
  plannedSubGenreIds: string[],
) => {
  const plannedIds = new Set(plannedSubGenreIds);
  const matched = classifications.flatMap((classification) => {
    const id = classification.subGenre?.id;
    if (!id || !plannedIds.has(id)) return [];
    return [{ id, name: classification.subGenre?.name }];
  });

  return uniqueById(matched);
};

const mergeRecommendationMetadata = (
  current: TicketmasterRecommendationMetadata[],
  next: TicketmasterRecommendationMetadata[],
) => {
  const byLane = new Map<string, TicketmasterRecommendationMetadata>();

  [...current, ...next].forEach((metadata) => {
    const key = [
      metadata.recommendationLane,
      metadata.attractionId ?? "",
      metadata.matchedSpotifyArtistId ?? "",
    ].join("|");
    const existing = byLane.get(key);

    byLane.set(
      key,
      existing
        ? {
            ...existing,
            sourceSpotifyGenreNames: unique([
              ...existing.sourceSpotifyGenreNames,
              ...metadata.sourceSpotifyGenreNames,
            ]),
            matchedTicketmasterSubGenreIds: unique([
              ...existing.matchedTicketmasterSubGenreIds,
              ...metadata.matchedTicketmasterSubGenreIds,
            ]),
            matchedTicketmasterSubGenreNames: unique([
              ...existing.matchedTicketmasterSubGenreNames,
              ...metadata.matchedTicketmasterSubGenreNames,
            ]),
            recommendationReasons: unique([
              ...existing.recommendationReasons,
              ...metadata.recommendationReasons,
            ]),
          }
        : metadata,
    );
  });

  return Array.from(byLane.values());
};

const unique = <T>(items: T[]) => Array.from(new Set(items));

const uniqueById = <T extends { id: string }>(items: T[]) =>
  Array.from(new Map(items.map((item) => [item.id, item])).values());
