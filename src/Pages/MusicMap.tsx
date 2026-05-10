import MapWindow from "../components/MapWindow";
import { useEffect, useState, useRef } from "react";
import Subgenres from "../data/ticketmaster/subgenres";
import LocalEvent from "../LocalEventClass";
import LocalVenue from "../LocalVenueClass";
import EventList from "../components/EventList";
import EventSettings from "../components/EventSettings";
import { TicketmasterQueryPlan } from "../types/ticketmaster";
import {
  buildTicketmasterArtistEventSearchPlan,
  buildTicketmasterSuggestedEventSearchPlan,
} from "../services/ticketmasterQueryPlan";
import { resolveTicketmasterAttractions } from "../services/ticketmasterAttractions";
import {
  getTicketmasterEventSearchDebugInfo,
  searchTicketmasterEvents,
  TicketmasterRawEventWithSource,
} from "../services/ticketmasterEvents";

import "../Styles/MusicMap.css";

interface Props {
  genres: string[];
  ticketmasterQueryPlan: TicketmasterQueryPlan | null;
}

interface FormDataValues {
  radius: number;
  unit: string;
  sortObject: string;
  sortOrder: string;
}

const DEBUG_TICKETMASTER_SEARCH = import.meta.env.DEV;
const PAUSE_TICKETMASTER_API =
  import.meta.env.DEV &&
  import.meta.env.VITE_PAUSE_TICKETMASTER_API === "true";

export default function MusicMap({ genres, ticketmasterQueryPlan }: Props) {
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [precision, setPrecision] = useState(0);
  const [fetched, setFetched] = useState(false);
  const [genreIds, setGenreIds] = useState<string[]>([]);
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [radius, setRadius] = useState(0);
  const [radiusUnit, setRadiusUnit] = useState("");
  const [sortObject, setSortObject] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState<
    [number, number] | null
  >(null);
  const [selectedID, setSelectedID] = useState<string | null>(null);

  const prevFormData = useRef<FormDataValues>({
    radius: -1,
    unit: "NONE",
    sortObject: "NONE",
    sortOrder: "NONE",
  });
  const completedSearchKeys = useRef(new Set<string>());
  const inFlightSearchKeys = useRef(new Set<string>());

  const getGenreIds = () => {
    let ids: string[] = [];
    genres.forEach((genre) => {
      if (genre in Subgenres) {
        ids.push(Subgenres[genre]);
      }
    });
    setGenreIds(ids);
    return ids;
  };

  const localEvents = async () => {
    const requestKey = getMusicMapRequestKey({
      latitude,
      longitude,
      radius: 100,
      unit: "miles",
      sort: "date,asc",
      size: 50,
      queryPlanGeneratedAt: ticketmasterQueryPlan?.generatedAt ?? "",
      sourceTasteProfileGeneratedAt:
        ticketmasterQueryPlan?.sourceTasteProfileGeneratedAt ?? "",
      classificationSearchId:
        ticketmasterQueryPlan?.classificationSearches[0]?.id ?? "",
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
    )
      return;

    inFlightSearchKeys.current.add(requestKey);
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
    const eventSearchSettings = {
      latitude,
      longitude,
      radius: 100,
      unit: "miles",
      size: 50,
      sort: "date,asc",
    };
    const eventResults: TicketmasterRawEventWithSource[] = [];

    try {
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
          const classificationSourceNames = ticketmasterQueryPlan.classificationSearches
            .filter((search) =>
              suggestedEventSearchPlan.sourceSearchIds.includes(search.id),
            )
            .flatMap((search) => search.sourceGenreNames);
          const suggestedSourceNames = [
            ...ticketmasterQueryPlan.suggestedSubgenreSearches
              .filter((search) =>
                suggestedEventSearchPlan.sourceSearchIds.includes(search.id),
              )
              .map((search) => search.sourceGenreName),
            ...classificationSourceNames,
          ];
          console.debug("suggested_event_search", {
            ...getTicketmasterEventSearchDebugInfo(suggestedEventSearchPlan),
            sourceGenreNames: suggestedSourceNames,
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
        dedupeTicketmasterEvents(eventResults),
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

  const handleEventSelect = (lat: number, lng: number, id: string) => {
    setSelectedCoordinates([lat, lng]);
    setSelectedID(id);
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
      setPrecision(position.coords.accuracy);
    });
  }, []);

  useEffect(() => {
    getGenreIds();
  }, [genres]);

  useEffect(() => {
    localEvents();
  }, [latitude, longitude, precision, genreIds, ticketmasterQueryPlan]);

  useEffect(() => {
    setFetched(false);
  }, [radius, radiusUnit, sortObject, sortOrder]);

  useEffect(() => {
    const form = document.getElementById(
      "event-settings-form",
    ) as HTMLFormElement;
    const submitButton = document.getElementById(
      "event-settings-submit",
    ) as HTMLButtonElement;

    const handleSubmit = (event: Event) => {
      event.preventDefault();

      const radiusEl = document.getElementById("radius") as HTMLInputElement;
      const unitEl = document.getElementById("radiusUnit") as HTMLInputElement;
      const sObjectEl = document.getElementById(
        "sortObject",
      ) as HTMLInputElement;
      const sOrderEl = document.getElementById("sortOrder") as HTMLInputElement;

      if (radiusEl && unitEl && sObjectEl && sOrderEl) {
        const formData: FormDataValues = {
          radius: Number(radiusEl.value),
          unit: unitEl.value,
          sortObject: sObjectEl.value,
          sortOrder: sOrderEl.value,
        };

        const isNewForm =
          formData.radius !== prevFormData.current.radius ||
          formData.unit !== prevFormData.current.unit ||
          formData.sortObject !== prevFormData.current.sortObject ||
          formData.sortOrder !== prevFormData.current.sortOrder;

        if (!isNewForm) {
          alert("Form not submitted: You cannot submit the same form twice.");
          return;
        }

        if (submitButton) submitButton.disabled = true;

        setRadius(formData.radius);
        setRadiusUnit(formData.unit);
        setSortObject(formData.sortObject);
        setSortOrder(formData.sortOrder);

        prevFormData.current = formData;

        setTimeout(() => {
          if (submitButton) submitButton.disabled = false;
        }, 5000);
      }
    };

    if (form) {
      form.addEventListener("submit", handleSubmit);
      return () => form.removeEventListener("submit", handleSubmit);
    }
  }, []);

  if (!sessionStorage.getItem("token")) {
    return (
      <div className="music-map-container">
        <h1>Please login.</h1>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3 event-page-container">
      {/* EVENT SETTINGS */}
      <h1 className="mb-2 mt-1 top-events-title text-center">
        <i className="bi bi-sliders"></i> Search Settings
        <i
          className="bi bi-arrow-down-square-fill d-md-none toggle-icon ms-2"
          data-bs-toggle="collapse"
          data-bs-target="#eventSettingsCollapse"
          aria-expanded="false"
          aria-controls="eventSettingsCollapse"
        ></i>
      </h1>

      {/* Event Settings - Collapse on small screens, visible on larger screens */}
      <div className="collapse d-md-block" id="eventSettingsCollapse">
        <div className="row mb-3">
          <div className="col-12">
            <EventSettings />
          </div>
        </div>
      </div>

      {/* MAP AND EVENT LIST */}
      <h1 className="mb-2 mt-1 top-events-title text-center">
        <i className="bi bi-calendar4-event"></i> Top Events Near You
      </h1>
      <div className="row event-list-map-container py-3">
        {/* MAP */}
        <div className="col-12 col-lg-6 map-container mb-5">
          <MapWindow
            mapLat={latitude}
            mapLong={longitude}
            events={events}
            selectedCoordinates={selectedCoordinates}
            selectedID={selectedID}
          />
        </div>

        {/* EVENT LIST */}
        <div className="col-12 col-lg-6 event-list-container m-0 p-0">
          <EventList events={events} onEventSelect={handleEventSelect} />
        </div>
      </div>
    </div>
  );
}

const dedupeTicketmasterEvents = (events: TicketmasterRawEventWithSource[]) => {
  const eventsById = new Map<string, TicketmasterRawEventWithSource>();
  events.forEach((eventWithSource) => {
    if (!eventsById.has(eventWithSource.event.id)) {
      eventsById.set(eventWithSource.event.id, eventWithSource);
    }
  });
  return Array.from(eventsById.values());
};

const mapTicketmasterEventsToLocalEvents = (
  events: TicketmasterRawEventWithSource[],
) =>
  events.map(({ event }) => {
    const venue = new LocalVenue(
      event._embedded.venues[0].name,
      event._embedded.venues[0].location.latitude,
      event._embedded.venues[0].location.longitude,
    );
    return new LocalEvent(
      event.name,
      event.id,
      event.images[0].url,
      venue,
      event.distance,
      event.url,
    );
  });

type MusicMapRequestKeyInput = {
  latitude: number;
  longitude: number;
  radius: number;
  unit: string;
  sort: string;
  size: number;
  queryPlanGeneratedAt: string;
  sourceTasteProfileGeneratedAt: string;
  classificationSearchId: string;
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
  classificationSearchId,
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
    classificationSearchId,
    suggestedSubgenreSearchIds.join(","),
    attractionSearchIds.join(","),
  ].join("|");
