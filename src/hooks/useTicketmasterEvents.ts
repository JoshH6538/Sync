import { useEffect, useRef, useState } from "react";
import LocalEvent from "../LocalEventClass";
import {
  buildTicketmasterArtistEventSearchPlan,
  buildTicketmasterSuggestedEventSearchPlan,
} from "../services/ticketmasterQueryPlan";
import { resolveTicketmasterAttractions } from "../services/ticketmasterAttractions";
import {
  getTicketmasterEventSearchDebugInfo,
  searchTicketmasterEvents,
  TicketmasterEventSearchSettings,
  TicketmasterRawEventWithSource,
} from "../services/ticketmasterEvents";
import {
  dedupeTicketmasterEvents,
  enrichTicketmasterEvents,
  mapTicketmasterEventsToLocalEvents,
} from "../services/ticketmasterEventEnrichment";
import { TicketmasterQueryPlan } from "../types/ticketmaster";

const DEBUG_TICKETMASTER_SEARCH = import.meta.env.DEV;
const PAUSE_TICKETMASTER_API =
  import.meta.env.DEV &&
  import.meta.env.VITE_PAUSE_TICKETMASTER_API === "true";

const DEFAULT_EVENT_SEARCH_SETTINGS = {
  radius: 100,
  unit: "miles",
  size: 50,
  sort: "date,asc",
};

type UseTicketmasterEventsInput = {
  latitude: number;
  longitude: number;
  ticketmasterQueryPlan: TicketmasterQueryPlan | null;
};

export const useTicketmasterEvents = ({
  latitude,
  longitude,
  ticketmasterQueryPlan,
}: UseTicketmasterEventsInput) => {
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [fetched, setFetched] = useState(false);
  const completedSearchKeys = useRef(new Set<string>());
  const inFlightSearchKeys = useRef(new Set<string>());

  useEffect(() => {
    setFetched(false);
  }, [latitude, longitude, ticketmasterQueryPlan]);

  useEffect(() => {
    const loadEvents = async () => {
      const requestKey = getMusicMapRequestKey({
        latitude,
        longitude,
        radius: DEFAULT_EVENT_SEARCH_SETTINGS.radius,
        unit: DEFAULT_EVENT_SEARCH_SETTINGS.unit,
        sort: DEFAULT_EVENT_SEARCH_SETTINGS.sort,
        size: DEFAULT_EVENT_SEARCH_SETTINGS.size,
        sourceTasteProfileGeneratedAt:
          ticketmasterQueryPlan?.sourceTasteProfileGeneratedAt ?? "",
        classificationSearchIds:
          ticketmasterQueryPlan?.classificationSearches.map((search) => search.id) ??
          [],
        suggestedSubgenreSearchIds:
          ticketmasterQueryPlan?.suggestedSubgenreSearches.map((search) => search.id) ??
          [],
        attractionSearchIds:
          ticketmasterQueryPlan?.attractionSearches.map((search) => search.id) ?? [],
      });

      if (
        (latitude === 0 && longitude === 0) ||
        !ticketmasterQueryPlan ||
        fetched ||
        completedSearchKeys.current.has(requestKey) ||
        inFlightSearchKeys.current.has(requestKey)
      ) {
        return;
      }

      inFlightSearchKeys.current.add(requestKey);

      try {
        const attractionResolutions = PAUSE_TICKETMASTER_API
          ? []
          : await resolveTicketmasterAttractions(
              ticketmasterQueryPlan.attractionSearches,
              import.meta.env.VITE_TICKETMASTER_KEY,
            );
        const artistEventSearchPlan = buildTicketmasterArtistEventSearchPlan(
          ticketmasterQueryPlan,
          attractionResolutions,
        );
        const suggestedEventSearchPlan =
          buildTicketmasterSuggestedEventSearchPlan(ticketmasterQueryPlan);
        const eventSearchSettings: TicketmasterEventSearchSettings = {
          latitude,
          longitude,
          ...DEFAULT_EVENT_SEARCH_SETTINGS,
        };
        const eventResults: TicketmasterRawEventWithSource[] = [];

        if (PAUSE_TICKETMASTER_API) {
          console.debug("ticketmaster_api_paused", {
            attractionSearchesCount: ticketmasterQueryPlan.attractionSearches.length,
            suggestedSubgenreSearchesCount:
              ticketmasterQueryPlan.suggestedSubgenreSearches.length,
            plannedSuggestedSubGenreIds:
              suggestedEventSearchPlan?.subGenreIds ?? [],
            artistEventSearchPlan,
            suggestedEventSearchPlan,
          });
          setFetched(true);
          completedSearchKeys.current.add(requestKey);
          return;
        }

        if (artistEventSearchPlan) {
          if (DEBUG_TICKETMASTER_SEARCH) console.debug("artist_event_search");
          eventResults.push(
            ...(await searchTicketmasterEvents(
              artistEventSearchPlan,
              import.meta.env.VITE_TICKETMASTER_KEY,
              eventSearchSettings,
            )),
          );
        } else if (DEBUG_TICKETMASTER_SEARCH) {
          console.debug("skipped_artist_event_search_no_attractions");
        }

        if (suggestedEventSearchPlan) {
          if (DEBUG_TICKETMASTER_SEARCH) {
            console.debug("suggested_event_search", {
              ...getTicketmasterEventSearchDebugInfo(suggestedEventSearchPlan),
              sourceGenreNames: getSuggestedSourceGenreNames(
                suggestedEventSearchPlan.sourceSearchIds,
                ticketmasterQueryPlan,
              ),
            });
          }
          eventResults.push(
            ...(await searchTicketmasterEvents(
              suggestedEventSearchPlan,
              import.meta.env.VITE_TICKETMASTER_KEY,
              eventSearchSettings,
            )),
          );
        } else if (DEBUG_TICKETMASTER_SEARCH) {
          console.debug("skipped_suggested_event_search_no_classifications");
        }

        const eventList = mapTicketmasterEventsToLocalEvents(
          dedupeTicketmasterEvents(
            enrichTicketmasterEvents(
              eventResults,
              ticketmasterQueryPlan,
              attractionResolutions,
            ),
          ),
        );

        if (eventList.length > 0) {
          setEvents(eventList);
        } else {
          alert("No results found. Please adjust your search settings.");
        }

        setFetched(true);
        completedSearchKeys.current.add(requestKey);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        inFlightSearchKeys.current.delete(requestKey);
      }
    };

    loadEvents();
  }, [fetched, latitude, longitude, ticketmasterQueryPlan]);

  return { events };
};

type MusicMapRequestKeyInput = {
  latitude: number;
  longitude: number;
  radius: number;
  unit: string;
  sort: string;
  size: number;
  sourceTasteProfileGeneratedAt: string;
  classificationSearchIds: string[];
  suggestedSubgenreSearchIds: string[];
  attractionSearchIds: string[];
};

const getMusicMapRequestKey = ({
  latitude,
  longitude,
  radius,
  unit,
  sort,
  size,
  sourceTasteProfileGeneratedAt,
  classificationSearchIds,
  suggestedSubgenreSearchIds,
  attractionSearchIds,
}: MusicMapRequestKeyInput) =>
  [
    latitude.toFixed(4),
    longitude.toFixed(4),
    radius,
    unit,
    sort,
    size,
    sourceTasteProfileGeneratedAt,
    stableIdList(classificationSearchIds),
    stableIdList(suggestedSubgenreSearchIds),
    stableIdList(attractionSearchIds),
  ].join("|");

const getSuggestedSourceGenreNames = (
  sourceSearchIds: string[],
  ticketmasterQueryPlan: TicketmasterQueryPlan,
) => [
  ...ticketmasterQueryPlan.suggestedSubgenreSearches
    .filter((search) => sourceSearchIds.includes(search.id))
    .map((search) => search.sourceGenreName),
  ...ticketmasterQueryPlan.classificationSearches
    .filter((search) => sourceSearchIds.includes(search.id))
    .flatMap((search) => search.sourceGenreNames),
];

const stableIdList = (ids: string[]) => ids.slice().sort().join(",");
