import MapWindow from "../components/MapWindow";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import EventList from "../components/EventList";
import LocalEvent from "../LocalEventClass";
import {
  TicketmasterAttractionSearchPlan,
  TicketmasterQueryPlan,
} from "../types/ticketmaster";
import { TasteArtist, TasteProfile } from "../types/taste";
import {
  type ArtistEventSearchStatus,
  type MusicMapSearchSettings,
  type MusicMapSearchStatus,
  useTicketmasterEvents,
} from "../hooks/useTicketmasterEvents";

import "../Styles/MusicMap.css";

interface Props {
  tasteProfile: TasteProfile | null;
  ticketmasterQueryPlan: TicketmasterQueryPlan | null;
}

type MusicMapLocationState = {
  artistEventSearch?: {
    artistId: string;
    artistName: string;
    artistNodeId: string;
    keyword: string;
    weight: number;
  };
};

type EventFilter = "all" | "artist" | "suggested";
type EventListLayout = "compact" | "grid";
type LocationStatus = "pending" | "ready" | "unavailable";
type SelectionSource = "map" | "list" | null;

const DEFAULT_SEARCH_SETTINGS: MusicMapSearchSettings = {
  radius: 100,
  unit: "miles",
  size: 50,
  sort: "date,asc",
};

export default function MusicMap({ tasteProfile, ticketmasterQueryPlan }: Props) {
  const location = useLocation();
  const routeArtistSearch = (location.state as MusicMapLocationState | null)
    ?.artistEventSearch;
  const initialArtistSearch = useMemo(
    () => (routeArtistSearch ? toAttractionSearchPlan(routeArtistSearch) : null),
    [routeArtistSearch],
  );

  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [locationStatus, setLocationStatus] =
    useState<LocationStatus>("pending");
  const [selectedCoordinates, setSelectedCoordinates] = useState<
    [number, number] | null
  >(null);
  const [selectedID, setSelectedID] = useState<string | null>(null);
  const [selectedVenueKey, setSelectedVenueKey] = useState<string | null>(null);
  const mapPanelRef = useRef<HTMLDivElement | null>(null);
  const [selectedArtistSearch, setSelectedArtistSearch] =
    useState<TicketmasterAttractionSearchPlan | null>(initialArtistSearch);
  const [filter, setFilter] = useState<EventFilter>("all");
  const [listLayout, setListLayout] = useState<EventListLayout>("compact");
  const [draftSettings, setDraftSettings] =
    useState<MusicMapSearchSettings>(DEFAULT_SEARCH_SETTINGS);
  const [searchSettings, setSearchSettings] =
    useState<MusicMapSearchSettings>(DEFAULT_SEARCH_SETTINGS);

  useEffect(() => {
    setSelectedArtistSearch(initialArtistSearch);
  }, [initialArtistSearch]);

  const selectedArtistGenres = useMemo(
    () =>
      tasteProfile?.artists.find(
        (artist) => artist.id === selectedArtistSearch?.artistId,
      )?.genres ?? [],
    [selectedArtistSearch?.artistId, tasteProfile],
  );

  const {
    events,
    isLoading,
    searchStatus,
    artistSearchStatus,
    apiPaused,
  } = useTicketmasterEvents({
    latitude,
    longitude,
    ticketmasterQueryPlan,
    selectedArtistSearch,
    selectedArtistGenres,
    searchSettings,
  });

  const visibleEvents = useMemo(
    () => getVisibleEvents(events, filter, searchSettings.sort),
    [events, filter, searchSettings.sort],
  );
  const resultCounts = useMemo(() => getResultCounts(events), [events]);
  const hasMixedResultTypes = resultCounts.artist > 0 && resultCounts.suggested > 0;
  const artistOptions = useMemo(
    () => tasteProfile?.artists.slice(0, 12) ?? [],
    [tasteProfile],
  );
  const selectedArtistName =
    selectedArtistSearch?.artistName ?? routeArtistSearch?.artistName;
  const statusContent = getStatusContent({
    apiPaused,
    artistName: selectedArtistName,
    artistSearchStatus,
    events,
    isLoading,
    locationStatus,
    searchStatus,
    selectedArtistSearch,
  });

  useEffect(() => {
    requestCurrentLocation();
  }, []);

  useEffect(() => {
    if (!selectedID) return;
    if (visibleEvents.some((event) => event.id === selectedID)) return;
    setSelectedID(null);
    setSelectedCoordinates(null);
    setSelectedVenueKey(null);
  }, [selectedID, visibleEvents]);

  useEffect(() => {
    if (filter === "artist" && resultCounts.artist < 1) setFilter("all");
    if (filter === "suggested" && resultCounts.suggested < 1) setFilter("all");
  }, [filter, resultCounts.artist, resultCounts.suggested]);

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      setLatitude(0);
      setLongitude(0);
      return;
    }

    setLocationStatus("pending");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLatitude = position.coords.latitude;
        const nextLongitude = position.coords.longitude;
        if (!Number.isFinite(nextLatitude) || !Number.isFinite(nextLongitude)) {
          setLocationStatus("unavailable");
          setLatitude(0);
          setLongitude(0);
          return;
        }

        setLatitude(nextLatitude);
        setLongitude(nextLongitude);
        setLocationStatus("ready");
      },
      () => {
        setLatitude(0);
        setLongitude(0);
        setLocationStatus("unavailable");
      },
      {
        enableHighAccuracy: false,
        maximumAge: 60000,
        timeout: 10000,
      },
    );
  };

  const handleEventSelect = (
    lat: number,
    lng: number,
    id: string,
    venueKey?: string,
    source: SelectionSource = "list",
  ) => {
    setSelectedCoordinates([lat, lng]);
    setSelectedID(id);
    setSelectedVenueKey(venueKey ?? null);
    if (source === "list") {
      mapPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handleMarkerSelect = (
    id: string,
    lat: number,
    lng: number,
    venueKey?: string,
  ) => {
    handleEventSelect(lat, lng, id, venueKey, "map");
  };

  const handleApplySearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSelectedID(null);
    setSelectedCoordinates(null);
    setSelectedVenueKey(null);
    setSearchSettings(draftSettings);
  };

  const handleArtistClick = (artistSearch: TicketmasterAttractionSearchPlan) => {
    setSelectedID(null);
    setSelectedCoordinates(null);
    setSelectedVenueKey(null);
    setSelectedArtistSearch(artistSearch);
    setFilter("all");
  };

  const handleTasteModeClick = () => {
    setSelectedID(null);
    setSelectedCoordinates(null);
    setSelectedVenueKey(null);
    setSelectedArtistSearch(null);
    setFilter("all");
  };

  if (!sessionStorage.getItem("token")) {
    return (
      <div className="music-map-page">
        <section className="music-map-empty">
          <h1>Please log in.</h1>
          <p>Sync needs your listening data before event discovery can start.</p>
        </section>
      </div>
    );
  }

  return (
    <main className="music-map-page">
      <section className="music-map-hero">
        <div>
          <p className="music-map-label">Music Map</p>
          <h1>
            {selectedArtistSearch
              ? `Event matches for ${selectedArtistSearch.artistName}`
              : "Taste-based events near you"}
          </h1>
          <p>
            {selectedArtistSearch
              ? "Sync checks that artist first, then keeps taste-based matches available."
              : "Sync uses your music taste to find nearby music events."}
          </p>
        </div>

        <div className="music-map-mark" aria-hidden="true">
          <img src="sync_icon.svg" alt="" />
        </div>
      </section>

      {statusContent ? (
        <section className={`music-map-status ${statusContent.tone}`}>
          <i className={`bi ${statusContent.icon}`}></i>
          <div>
            <h2>{statusContent.title}</h2>
            <p>{statusContent.body}</p>
          </div>
          {statusContent.showLocationAction ? (
            <button type="button" onClick={requestCurrentLocation}>
              <i className="bi bi-crosshair"></i>
              Use current location
            </button>
          ) : null}
        </section>
      ) : null}

      {locationStatus === "ready" ? (
        <section className="music-map-location-context">
          <i className="bi bi-geo-alt"></i>
          <div>
            <p className="music-map-label">Location</p>
            <h2>{formatLocation(latitude, longitude, locationStatus)}</h2>
            <span>
              Searching within {searchSettings.radius} {searchSettings.unit}
            </span>
          </div>
          <button type="button" onClick={requestCurrentLocation}>
            <i className="bi bi-crosshair"></i>
            Use current location
          </button>
        </section>
      ) : null}

      {artistOptions.length > 0 ? (
        <section className="music-map-artist-row" aria-label="Artist event search">
          <div className="music-map-artist-copy">
            <p className="music-map-label">Artist matches</p>
            <h2>Explore one artist at a time</h2>
            <span>Pick one artist to check. Taste matches stay available.</span>
          </div>
          <div className="music-map-artist-list">
            {selectedArtistSearch ? (
              <button
                className="music-map-artist-reset"
                type="button"
                onClick={handleTasteModeClick}
                disabled={isLoading || artistSearchStatus === "resolving"}
              >
                <i className="bi bi-arrow-counterclockwise"></i>
                Back to taste discovery
              </button>
            ) : null}
            {artistOptions.map((artist) => {
              const artistSearch = toAttractionSearchPlanFromTasteArtist(artist);
              return (
                <button
                  type="button"
                  key={artist.id}
                  className={
                    selectedArtistSearch?.artistId === artist.id
                      ? "is-active"
                      : ""
                  }
                  disabled={isLoading || artistSearchStatus === "resolving"}
                  onClick={() => handleArtistClick(artistSearch)}
                >
                  <span className="music-map-artist-index">
                    {String(artist.rank).padStart(2, "0")}
                  </span>
                  <span>
                    <strong>{artist.name}</strong>
                    <small>Explore event matches</small>
                  </span>
                  <i
                    className={
                      selectedArtistSearch?.artistId === artist.id
                        ? "bi bi-check2-circle"
                        : "bi bi-arrow-right"
                    }
                  ></i>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="music-map-workspace">
        <div className="music-map-panel music-map-panel-map" ref={mapPanelRef}>
          {locationStatus === "pending" ? (
            <MapPlaceholder title="Getting your location" />
          ) : locationStatus === "unavailable" ? (
            <MapPlaceholder title="Location unavailable" />
          ) : (
            <MapWindow
              mapLat={latitude}
              mapLong={longitude}
              events={visibleEvents}
              selectedCoordinates={selectedCoordinates}
              selectedID={selectedID}
              selectedVenueKey={selectedVenueKey}
              onEventSelect={handleMarkerSelect}
            />
          )}
        </div>

        <section className="music-map-controls">
          <div className="music-map-applied-context">
            <p className="music-map-label">Applied search</p>
            <h2>
              Showing results within {searchSettings.radius}{" "}
              {searchSettings.unit}, sorted by{" "}
              {searchSettings.sort === "distance,asc" ? "distance" : "date"}.
            </h2>
            <span>Edits below apply only after Apply search.</span>
          </div>
          <form onSubmit={handleApplySearch}>
            <label>
              Radius
              <input
                type="number"
                min="1"
                max="1000"
                value={draftSettings.radius}
                onChange={(event) =>
                  setDraftSettings((current) => ({
                    ...current,
                    radius: Number(event.target.value),
                  }))
                }
              />
            </label>
            <label>
              Unit
              <select
                value={draftSettings.unit}
                onChange={(event) =>
                  setDraftSettings((current) => ({
                    ...current,
                    unit: event.target.value as MusicMapSearchSettings["unit"],
                  }))
                }
              >
                <option value="miles">Miles</option>
                <option value="km">Km</option>
              </select>
            </label>
            <label>
              Sort
              <select
                value={draftSettings.sort}
                onChange={(event) =>
                  setDraftSettings((current) => ({
                    ...current,
                    sort: event.target.value,
                  }))
                }
              >
                <option value="date,asc">Date</option>
                <option value="distance,asc">Distance</option>
              </select>
            </label>
            <button type="submit">Apply search</button>
          </form>
        </section>

        <div className="music-map-panel music-map-panel-list">
          <div className="music-map-list-heading">
            <div>
              <p className="music-map-label">Event list</p>
              <h2>Curated matches - {visibleEvents.length} events</h2>
            </div>
            <div className="music-map-list-tools">
              {isLoading ? <span>Searching...</span> : null}
              {hasMixedResultTypes ? (
                <div className="music-map-filter-group" aria-label="Event filters">
                  <FilterButton
                    active={filter === "all"}
                    count={events.length}
                    label="All"
                    onClick={() => setFilter("all")}
                  />
                  <FilterButton
                    active={filter === "artist"}
                    count={resultCounts.artist}
                    label="Artist matches"
                    onClick={() => setFilter("artist")}
                  />
                  <FilterButton
                    active={filter === "suggested"}
                    count={resultCounts.suggested}
                    label="Taste matches"
                    onClick={() => setFilter("suggested")}
                  />
                </div>
              ) : null}
              <div className="music-map-layout-toggle" aria-label="Event list layout">
                <button
                  type="button"
                  className={listLayout === "compact" ? "is-active" : ""}
                  onClick={() => setListLayout("compact")}
                >
                  <i className="bi bi-list"></i>
                  Compact
                </button>
                <button
                  type="button"
                  className={listLayout === "grid" ? "is-active" : ""}
                  onClick={() => setListLayout("grid")}
                >
                  <i className="bi bi-grid"></i>
                  Cards
                </button>
              </div>
            </div>
          </div>

          {visibleEvents.length > 0 ? (
            <EventList
              events={visibleEvents}
              layout={listLayout}
              onEventSelect={handleEventSelect}
              selectedID={selectedID}
              selectedVenueKey={selectedVenueKey}
              shouldScrollToSelection={false}
              showTypeTags={hasMixedResultTypes && filter === "all"}
            />
          ) : (
            <EmptyState
              status={searchStatus}
              filter={filter}
              artistSearchStatus={artistSearchStatus}
              artistName={selectedArtistName}
            />
          )}
        </div>
      </section>
    </main>
  );
}

type FilterButtonProps = {
  active: boolean;
  count: number;
  label: string;
  onClick: () => void;
};

function FilterButton({ active, count, label, onClick }: FilterButtonProps) {
  return (
    <button
      type="button"
      className={active ? "is-active" : ""}
      onClick={onClick}
    >
      {label}
      <span>{count}</span>
    </button>
  );
}

function MapPlaceholder({ title }: { title: string }) {
  return (
    <div className="music-map-placeholder">
      <i className="bi bi-geo-alt"></i>
      <h2>{title}</h2>
      <p>Map appears after Sync has usable coordinates.</p>
    </div>
  );
}

type EmptyStateProps = {
  status: MusicMapSearchStatus;
  filter: EventFilter;
  artistSearchStatus: ArtistEventSearchStatus;
  artistName?: string;
};

type MusicMapStatusContent = {
  icon: string;
  tone: "info" | "warn" | "success";
  title: string;
  body: string;
  showLocationAction?: boolean;
};

function EmptyState({
  status,
  filter,
  artistSearchStatus,
  artistName,
}: EmptyStateProps) {
  const copy = getEmptyStateCopy(status, filter, artistSearchStatus, artistName);

  return (
    <div className="music-map-empty">
      <i className={`bi ${copy.icon}`}></i>
      <h2>{copy.title}</h2>
      <p>{copy.body}</p>
    </div>
  );
}

const toAttractionSearchPlan = (
  artist: NonNullable<MusicMapLocationState["artistEventSearch"]>,
): TicketmasterAttractionSearchPlan => ({
  id: `ticketmaster:attraction-search:${normalizeSearchText(artist.artistName)}`,
  artistId: artist.artistId,
  artistName: artist.artistName,
  artistNodeId: artist.artistNodeId,
  keyword: artist.keyword,
  weight: artist.weight,
  reason: "top_artist",
});

const toAttractionSearchPlanFromTasteArtist = (
  artist: TasteArtist,
): TicketmasterAttractionSearchPlan => ({
  id: `ticketmaster:attraction-search:${normalizeSearchText(artist.name)}`,
  artistId: artist.id,
  artistName: artist.name,
  artistNodeId: artist.nodeId,
  keyword: artist.name,
  weight: artist.weight,
  reason: artist.weightParts.trackSupport > 0 ? "track_supported_artist" : "top_artist",
});

const getVisibleEvents = (
  events: LocalEvent[],
  filter: EventFilter,
  sort: string,
) =>
  events
    .filter((event) => {
      if (filter === "all") return true;
      return event.recommendationMetadata?.some(
        (metadata) => metadata.recommendationLane === filter,
      );
    })
    .slice()
    .sort((a, b) => {
      if (sort === "distance,asc") return a.distance - b.distance;
      return getEventDateValue(a) - getEventDateValue(b);
    });

const getResultCounts = (events: LocalEvent[]) =>
  events.reduce(
    (counts, event) => {
      const lanes = new Set(
        event.recommendationMetadata?.map(
          (metadata) => metadata.recommendationLane,
        ) ?? [],
      );
      if (lanes.has("artist")) counts.artist += 1;
      if (lanes.has("suggested")) counts.suggested += 1;
      return counts;
    },
    { artist: 0, suggested: 0 },
  );

const getEventDateValue = (event: LocalEvent) => {
  if (!event.date) return Number.MAX_SAFE_INTEGER;
  const parsedDate = new Date(`${event.date}T${event.time ?? "00:00:00"}`);
  return Number.isNaN(parsedDate.getTime())
    ? Number.MAX_SAFE_INTEGER
    : parsedDate.getTime();
};

const getStatusContent = ({
  apiPaused,
  artistName,
  artistSearchStatus,
  events,
  isLoading,
  locationStatus,
  searchStatus,
  selectedArtistSearch,
}: {
  apiPaused: boolean;
  artistName?: string;
  artistSearchStatus: ArtistEventSearchStatus;
  events: LocalEvent[];
  isLoading: boolean;
  locationStatus: LocationStatus;
  searchStatus: MusicMapSearchStatus;
  selectedArtistSearch: TicketmasterAttractionSearchPlan | null;
}): MusicMapStatusContent | null => {
  if (apiPaused || searchStatus === "paused") {
    return {
      icon: "bi-pause-circle",
      tone: "warn",
      title: "Ticketmaster API paused",
      body: "Dev pause is active, so Sync is not calling Ticketmaster.",
    };
  }

  if (locationStatus === "pending" || searchStatus === "waiting_for_location") {
    return {
      icon: "bi-geo",
      tone: "info",
      title: "Getting location",
      body: "Sync needs nearby coordinates before event search starts.",
      showLocationAction: true,
    };
  }

  if (locationStatus === "unavailable") {
    return {
      icon: "bi-exclamation-triangle",
      tone: "warn",
      title: "Location unavailable",
      body: "Allow location access, then use current location to search nearby events.",
      showLocationAction: true,
    };
  }

  if (searchStatus === "missing_plan") {
    return {
      icon: "bi-soundwave",
      tone: "info",
      title: "Building recommendations",
      body: "Sync is preparing your music taste event search plan.",
    };
  }

  if (isLoading || searchStatus === "searching" || artistSearchStatus === "resolving") {
    return {
      icon: "bi-search",
      tone: "info",
      title: selectedArtistSearch ? "Checking artist matches" : "Searching taste matches",
      body: selectedArtistSearch
        ? `Checking Ticketmaster for ${selectedArtistSearch.artistName}, then loading taste matches.`
        : "Searching nearby events from your music taste.",
    };
  }

  if (artistSearchStatus === "no_match") {
    return {
      icon: "bi-signpost-split",
      tone: "warn",
      title: "No artist match found",
      body: `No Ticketmaster artist match found for ${artistName}. Showing taste-based matches instead.`,
    };
  }

  if (artistSearchStatus === "no_events") {
    return {
      icon: "bi-calendar-x",
      tone: "warn",
      title: "No nearby artist events",
      body: `No nearby direct events found for ${artistName}. Checking nearby events from that artist's genres.`,
    };
  }

  if (artistSearchStatus === "artist_genre_fallback") {
    return {
      icon: "bi-vinyl",
      tone: "info",
      title:
        events.length > 0
          ? "Showing related genre matches"
          : "No related genre events",
      body:
        events.length > 0
          ? `Showing events from ${artistName}'s genres instead of broad taste matches.`
          : `No direct or related genre events found near you for ${artistName}.`,
    };
  }

  if (artistSearchStatus === "events_found") {
    return {
      icon: "bi-stars",
      tone: "success",
      title: "Artist and taste matches loaded",
      body: `Showing direct matches for ${artistName} with taste-based events available too.`,
    };
  }

  if (events.length < 1 && searchStatus === "empty") {
    return {
      icon: "bi-calendar-x",
      tone: "warn",
      title: "No nearby events found",
      body: "Try a wider radius or search again later.",
    };
  }

  if (searchStatus === "error") {
    return {
      icon: "bi-exclamation-circle",
      tone: "warn",
      title: "Event search failed",
      body: "Ticketmaster search did not complete. Try applying search again.",
    };
  }

  return null;
};

const getEmptyStateCopy = (
  status: MusicMapSearchStatus,
  filter: EventFilter,
  artistSearchStatus: ArtistEventSearchStatus,
  artistName?: string,
) => {
  if (filter === "artist") {
    return {
      icon: "bi-person-video3",
      title: "No artist matches in this view",
      body: artistName
        ? `No direct artist events for ${artistName} are in the current results.`
        : "Pick an artist to explore direct event matches.",
    };
  }

  if (filter === "suggested") {
    return {
      icon: "bi-vinyl",
      title: "No taste matches in this view",
      body: "Try all events or widen the search radius.",
    };
  }

  if (artistSearchStatus === "no_match") {
    return {
      icon: "bi-signpost-split",
      title: "No Ticketmaster artist match",
      body: "Sync could not resolve that artist. Taste-based matches will appear when available.",
    };
  }

  if (status === "paused") {
    return {
      icon: "bi-pause-circle",
      title: "Ticketmaster API paused",
      body: "Disable dev pause to load live event results.",
    };
  }

  if (status === "waiting_for_location") {
    return {
      icon: "bi-geo",
      title: "Waiting for location",
      body: "Allow location access to search nearby events.",
    };
  }

  return {
    icon: "bi-calendar-x",
    title: "No events found",
    body: "Try a wider radius or different sort setting.",
  };
};

const formatLocation = (
  latitude: number,
  longitude: number,
  status: LocationStatus,
) => {
  if (status === "pending") return "Getting location";
  if (status === "unavailable") return "Location unavailable";
  return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
};

const normalizeSearchText = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLowerCase();
