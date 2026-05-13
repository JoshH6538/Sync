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
  TicketmasterSuggestedSubgenreSearchPlan,
  TicketmasterQueryPlan,
} from "../types/ticketmaster";
import { getTicketmasterGenreMapping } from "../services/ticketmasterGenreMapping";

const DEBUG_TICKETMASTER_SEARCH = import.meta.env.DEV;
const PAUSE_TICKETMASTER_API =
  import.meta.env.DEV && import.meta.env.VITE_PAUSE_TICKETMASTER_API === "true";

export type MusicMapSearchSettings = {
  radius: number;
  unit: "miles" | "km";
  size: number;
  sort: string;
};

const DEFAULT_EVENT_SEARCH_SETTINGS: MusicMapSearchSettings = {
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
  selectedArtistGenres?: string[];
  searchSettings?: MusicMapSearchSettings;
};

export const useTicketmasterEvents = ({
  latitude,
  longitude,
  ticketmasterQueryPlan,
  selectedArtistSearch,
  selectedArtistGenres = [],
  searchSettings = DEFAULT_EVENT_SEARCH_SETTINGS,
}: UseTicketmasterEventsInput) => {
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [fetched, setFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchStatus, setSearchStatus] =
    useState<MusicMapSearchStatus>("idle");
  const [artistSearchStatus, setArtistSearchStatus] =
    useState<ArtistEventSearchStatus>("idle");
  const hasUsableCoordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    !(latitude === 0 && longitude === 0);

  // duplicate request prevention - keep track of completed and in-flight search keys
  const completedSearchKeys = useRef(new Set<string>());
  const inFlightSearchKeys = useRef(new Set<string>());

  useEffect(() => {
    setFetched(false);
    setArtistSearchStatus("idle");
  }, [
    hasUsableCoordinates,
    latitude,
    longitude,
    ticketmasterQueryPlan,
    selectedArtistSearch,
    selectedArtistGenres,
    searchSettings,
  ]);

  useEffect(() => {
    const loadEvents = async () => {
      if (!hasUsableCoordinates) {
        setIsLoading(false);
        setSearchStatus("waiting_for_location");
        return;
      }

      if (!ticketmasterQueryPlan) {
        setIsLoading(false);
        setSearchStatus("missing_plan");
        return;
      }

      const requestKey = getMusicMapRequestKey({
        latitude,
        longitude,
        radius: searchSettings.radius,
        unit: searchSettings.unit,
        sort: searchSettings.sort,
        size: searchSettings.size,
        sourceTasteProfileGeneratedAt:
          ticketmasterQueryPlan.sourceTasteProfileGeneratedAt,
        classificationSearchIds: ticketmasterQueryPlan.classificationSearches.map(
          (search) => search.id,
        ),
        suggestedSubgenreSearchIds:
          ticketmasterQueryPlan.suggestedSubgenreSearches.map(
            (search) => search.id,
          ),
        selectedArtistSearchId: selectedArtistSearch?.id ?? "",
        selectedArtistGenreIds: selectedArtistGenres,
      });

      if (
        fetched ||
        completedSearchKeys.current.has(requestKey) ||
        inFlightSearchKeys.current.has(requestKey)
      ) {
        return;
      }

      inFlightSearchKeys.current.add(requestKey);
      setIsLoading(true);
      setSearchStatus("searching");

      try {
        let attractionResolutions: TicketmasterAttractionResolution[] = [];
        const suggestedEventSearchPlan =
          buildTicketmasterSuggestedEventSearchPlan(ticketmasterQueryPlan);
        const artistSuggestedSearchPlan = selectedArtistSearch
          ? buildArtistSuggestedEventSearchPlan(
              selectedArtistSearch,
              selectedArtistGenres,
            )
          : null;
        const eventSearchSettings: TicketmasterEventSearchSettings = {
          latitude,
          longitude,
          ...searchSettings,
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
          setEvents([]);
          setSearchStatus("paused");
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

        const shouldUseArtistGenreFallback =
          selectedArtistSearch &&
          !eventResults.some((result) => result.source === "artist") &&
          artistSuggestedSearchPlan;
        const shouldUseGeneralSuggestedFallback =
          !selectedArtistSearch ||
          (selectedArtistSearch &&
            !eventResults.some((result) => result.source === "artist") &&
            !artistSuggestedSearchPlan);
        const activeSuggestedEventSearchPlan = shouldUseArtistGenreFallback
          ? artistSuggestedSearchPlan
          : shouldUseGeneralSuggestedFallback
            ? suggestedEventSearchPlan
            : null;

        if (activeSuggestedEventSearchPlan) {
          if (shouldUseArtistGenreFallback) {
            setArtistSearchStatus("artist_genre_fallback");
          }
          if (DEBUG_TICKETMASTER_SEARCH) {
            console.debug("suggested_event_search", {
              ...getTicketmasterEventSearchDebugInfo(activeSuggestedEventSearchPlan),
              sourceGenreNames: getSuggestedSourceGenreNames(
                activeSuggestedEventSearchPlan.sourceSearchIds,
                ticketmasterQueryPlan,
              ),
            });
          }
          eventResults.push(
            ...(await searchTicketmasterEvents(
              activeSuggestedEventSearchPlan,
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
              artistSuggestedSearchPlan
                ? {
                    ...ticketmasterQueryPlan,
                    suggestedSubgenreSearches: [
                      ...artistSuggestedSearchPlanToQuerySearches(
                        selectedArtistGenres,
                        selectedArtistSearch,
                      ),
                      ...ticketmasterQueryPlan.suggestedSubgenreSearches,
                    ],
                  }
                : ticketmasterQueryPlan,
              attractionResolutions,
            ),
          ),
        );

        setEvents(eventList);
        setSearchStatus(eventList.length > 0 ? "results" : "empty");

        setFetched(true);
        completedSearchKeys.current.add(requestKey);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setSearchStatus("error");
      } finally {
        inFlightSearchKeys.current.delete(requestKey);
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [
    fetched,
    hasUsableCoordinates,
    latitude,
    longitude,
    searchSettings,
    selectedArtistSearch,
    selectedArtistGenres,
    ticketmasterQueryPlan,
  ]);

  return {
    events,
    isLoading,
    searchStatus,
    artistSearchStatus,
    apiPaused: PAUSE_TICKETMASTER_API,
  };
};

export type MusicMapSearchStatus =
  | "idle"
  | "waiting_for_location"
  | "missing_plan"
  | "searching"
  | "results"
  | "empty"
  | "paused"
  | "error";

export type ArtistEventSearchStatus =
  | "idle"
  | "resolving"
  | "events_found"
  | "no_match"
  | "no_events"
  | "artist_genre_fallback"
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
  selectedArtistGenreIds: string[];
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
  selectedArtistGenreIds,
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
    stableIdList(selectedArtistGenreIds),
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

const buildArtistSuggestedEventSearchPlan = (
  selectedArtistSearch: TicketmasterAttractionSearchPlan,
  genres: string[],
) => {
  const artistSuggestedSearches = artistSuggestedSearchPlanToQuerySearches(
    genres,
    selectedArtistSearch,
  );

  const subGenreIds = unique(
    artistSuggestedSearches.map((search) => search.subGenreId),
  ).slice(0, 8);

  if (subGenreIds.length < 1) return null;

  return {
    kind: "suggested" as const,
    attractionIds: [],
    genreIds: [],
    subGenreIds,
    sourceSearchIds: artistSuggestedSearches
      .filter((search) => subGenreIds.includes(search.subGenreId))
      .map((search) => search.id),
    matchedReasons: ["artist_genre_fallback"],
  };
};

const artistSuggestedSearchPlanToQuerySearches = (
  genres: string[],
  selectedArtistSearch?: TicketmasterAttractionSearchPlan | null,
): TicketmasterSuggestedSubgenreSearchPlan[] =>
  unique(genres)
    .flatMap((genre) => {
      const mapping = getTicketmasterGenreMapping(genre);
      if (!mapping.ticketmasterSubGenreId) return [];

      return [
        {
          id: [
            "ticketmaster:artist-suggested-subgenre",
            selectedArtistSearch?.artistId ?? "selected",
            mapping.ticketmasterSubGenreId,
          ].join(":"),
          subGenreId: mapping.ticketmasterSubGenreId,
          sourceGenreName: genre,
          sourceNodeId: selectedArtistSearch?.artistNodeId ?? "",
          weight: selectedArtistSearch?.weight ?? 1,
        },
      ];
    })
    .slice(0, 8);

const unique = <T>(items: T[]) => Array.from(new Set(items));
