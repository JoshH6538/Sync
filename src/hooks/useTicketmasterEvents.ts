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
import {
  TicketmasterAttractionResolution,
  TicketmasterAttractionSearchPlan,
  TicketmasterQueryPlan,
} from "../types/ticketmaster";

const DEBUG_TICKETMASTER_SEARCH = import.meta.env.DEV;
const PAUSE_TICKETMASTER_API =
  import.meta.env.DEV && import.meta.env.VITE_PAUSE_TICKETMASTER_API === "true";

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
  selectedArtistSearch?: TicketmasterAttractionSearchPlan | null;
};

export const useTicketmasterEvents = ({
  latitude,
  longitude,
  ticketmasterQueryPlan,
  selectedArtistSearch,
}: UseTicketmasterEventsInput) => {
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [fetched, setFetched] = useState(false);
  const [artistSearchStatus, setArtistSearchStatus] =
    useState<ArtistEventSearchStatus>("idle");

  // duplicate request prevention - keep track of completed and in-flight search keys
  const completedSearchKeys = useRef(new Set<string>());
  const inFlightSearchKeys = useRef(new Set<string>());

  useEffect(() => {
    setFetched(false);
    setArtistSearchStatus("idle");
  }, [latitude, longitude, ticketmasterQueryPlan, selectedArtistSearch]);

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
          ticketmasterQueryPlan?.classificationSearches.map(
            (search) => search.id,
          ) ?? [],
        suggestedSubgenreSearchIds:
          ticketmasterQueryPlan?.suggestedSubgenreSearches.map(
            (search) => search.id,
          ) ?? [],
        selectedArtistSearchId: selectedArtistSearch?.id ?? "",
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
        let attractionResolutions: TicketmasterAttractionResolution[] = [];
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
            selectedArtistSearch: selectedArtistSearch?.artistName,
            suggestedSubgenreSearchesCount:
              ticketmasterQueryPlan.suggestedSubgenreSearches.length,
            plannedSuggestedSubGenreIds:
              suggestedEventSearchPlan?.subGenreIds ?? [],
            suggestedEventSearchPlan,
          });
          setArtistSearchStatus(selectedArtistSearch ? "paused" : "idle");
          setFetched(true);
          completedSearchKeys.current.add(requestKey);
          return;
        }

        if (selectedArtistSearch) {
          setArtistSearchStatus("resolving");
          attractionResolutions = await resolveTicketmasterAttractions(
            [selectedArtistSearch],
            import.meta.env.VITE_TICKETMASTER_KEY,
          );
          const [artistResolution] = attractionResolutions;

          if (artistResolution?.status === "matched") {
            const artistQueryPlan = {
              ...ticketmasterQueryPlan,
              attractionSearches: [selectedArtistSearch],
            };
            const artistEventSearchPlan = buildTicketmasterArtistEventSearchPlan(
              artistQueryPlan,
              attractionResolutions,
            );

            if (artistEventSearchPlan) {
              if (DEBUG_TICKETMASTER_SEARCH) console.debug("artist_event_search");
              const artistResults = await searchTicketmasterEvents(
                artistEventSearchPlan,
                import.meta.env.VITE_TICKETMASTER_KEY,
                eventSearchSettings,
              );
              eventResults.push(...artistResults);
              setArtistSearchStatus(
                artistResults.length > 0 ? "events_found" : "no_events",
              );
            }
          } else {
            setArtistSearchStatus("no_match");
          }
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

        setEvents(eventList);

        if (eventList.length < 1) {
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
  }, [fetched, latitude, longitude, selectedArtistSearch, ticketmasterQueryPlan]);

  return { events, artistSearchStatus };
};

export type ArtistEventSearchStatus =
  | "idle"
  | "resolving"
  | "events_found"
  | "no_match"
  | "no_events"
  | "paused";

/**
 * Inputs that define one unique Music Map event search.
 *
 * These values are used only to prevent duplicate local searches.
 * They are not the Ticketmaster request cache key itself.
 */
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
  selectedArtistSearchId: string;
};

/**
 * Builds a stable key for the current Music Map search.
 *
 * If the same key is already in-flight or completed, the hook skips it
 * to avoid duplicate Ticketmaster API calls from re-renders or StrictMode.
 *
 * The key changes when location, search settings, TasteProfile version,
 * or planned Ticketmaster search IDs change.
 */
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
  selectedArtistSearchId,
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
    selectedArtistSearchId,
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
