import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import LocalEvent from "../LocalEventClass";
import { getEventLocationKey } from "../utils/musicMapEvents";
import "../Styles/Map.css";

interface Props {
  // User Coordinates
  mapLat: number;
  mapLong: number;
  // Array of Event Objects
  events: LocalEvent[];
  // One set of coordinates to set active event to show on map
  selectedCoordinates?: [number, number] | null;
  selectedID?: string | null;
  selectedVenueKey?: string | null;
  onEventSelect?: (
    id: string,
    lat: number,
    lng: number,
    venueKey: string,
  ) => void;
}
const userLocationIcon = L.divIcon({
  className: "sync-user-marker-shell",
  html: '<span class="sync-user-marker" aria-label="Current location"></span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

function Refresh({ mapLat, mapLong }: Props) {
  const map = useMap();
  map.invalidateSize();
  map.setView([mapLat, mapLong], map.getZoom());
  return null;
}

const MapWindow = ({
  mapLat,
  mapLong,
  events,
  selectedCoordinates,
  selectedID,
  selectedVenueKey,
  onEventSelect,
}: Props) => {
  // Stores refs w/ event id
  const popupRefs = useRef<{ [key: string]: any }>({});
  const venueGroups = getVenueGroups(events);

  // If the selected coordinates are changed, go to the new coordinates
  function CenterOnEvent({
    coordinates,
    id,
  }: {
    coordinates: [number, number] | null;
    id: string | null | undefined;
  }) {
    const map = useMap();

    useEffect(() => {
      if (coordinates) {
        const zoom = map.getZoom();
        const popupOffset = Math.min(
          180,
          Math.max(90, map.getSize().y * 0.22),
        );
        const targetCenter = map.unproject(
          map.project(coordinates, zoom).subtract([0, popupOffset]),
          zoom,
        );

        map.flyTo(targetCenter, zoom, { duration: 1 });
        if (id && popupRefs.current[id]) {
          popupRefs.current[id].openOn(map);
        }
      }
    }, [coordinates, map, id]);
    return null;
  }

  return (
    <div className="map-container">
      <div className="sync-map-legend" aria-label="Map marker legend">
        <span>
          <i className="legend-dot single"></i>
          Event
        </span>
        <span>
          <i className="legend-dot group"></i>
          Venue group
        </span>
        <span>
          <i className="legend-dot user"></i>
          Your location
        </span>
      </div>
      <MapContainer center={[mapLat, mapLong]} zoom={8} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={[mapLat, mapLong]}
          icon={userLocationIcon}
          alt="Current location"
        />
        <Refresh mapLat={mapLat} mapLong={mapLong} events={events} />

        {venueGroups.map((group) => (
          <Marker
            key={group.key}
            position={[group.latitude, group.longitude]}
            icon={createVenueIcon(
              group.events.length,
              selectedVenueKey === group.key ||
                group.events.some((event) => event.id === selectedID),
            )}
            alt="Event Location Marker"
            eventHandlers={{
              click: () => {
                const [firstEvent] = group.events;
                onEventSelect?.(
                  firstEvent.id,
                  group.latitude,
                  group.longitude,
                  group.key,
                );
              },
            }}
          >
            <Popup
              className="pop-up"
              ref={(el) => {
                if (el) {
                  popupRefs.current[group.events[0].id] = el;
                  popupRefs.current[group.key] = el;
                }
              }}
            >
              <div
                className="sync-map-popup"
                onClick={stopPopupPropagation}
                onMouseDown={stopPopupPropagation}
              >
                {group.events.length === 1 ? (
                  <SingleEventPopup event={group.events[0]} />
                ) : (
                  <VenueGroupPopup
                    events={group.events}
                    group={group}
                    onEventSelect={onEventSelect}
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {selectedCoordinates && (
          <CenterOnEvent
            coordinates={selectedCoordinates}
            id={selectedVenueKey ?? selectedID}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapWindow;

type VenueEventGroup = {
  key: string;
  venueName: string;
  latitude: number;
  longitude: number;
  events: LocalEvent[];
};

type VenueGroupPopupProps = {
  events: LocalEvent[];
  group: VenueEventGroup;
  onEventSelect?: Props["onEventSelect"];
};

function SingleEventPopup({
  event,
  onBack,
}: {
  event: LocalEvent;
  onBack?: () => void;
}) {
  const location = [event.city, event.state].filter(Boolean).join(", ");

  return (
    <div className="sync-map-popup-single">
      {onBack ? (
        <button
          type="button"
          className="sync-map-popup-back"
          onClick={(event) => {
            stopPopupAction(event);
            onBack();
          }}
        >
          <i className="bi bi-arrow-left"></i>
          Venue events
        </button>
      ) : null}
      {event.image ? (
        <img src={event.image} alt={event.name} />
      ) : null}
      <div className="sync-map-popup-body">
        <span>{formatPopupDate(event.date, event.time)}</span>
        <strong>{event.name}</strong>
        <p>
          {event.venue.name}
          {location ? `, ${location}` : ""}
        </p>
        <a href={event.url} target="_blank" rel="noreferrer">
          View on Ticketmaster
        </a>
      </div>
    </div>
  );
}

function VenueGroupPopup({
  events,
  group,
}: VenueGroupPopupProps) {
  const [selectedEvent, setSelectedEvent] = useState<LocalEvent | null>(null);

  if (selectedEvent) {
    return (
      <SingleEventPopup
        event={selectedEvent}
        onBack={() => setSelectedEvent(null)}
      />
    );
  }

  return (
    <>
      <div className="sync-map-popup-header">
        <strong>{group.venueName}</strong>
        <span>
          {events.length} event{events.length === 1 ? "" : "s"} at this venue
        </span>
      </div>
      <div className="sync-map-popup-events">
        {events.map((event) => (
          <div className="sync-map-popup-event-row" key={event.id}>
            <button
              type="button"
              onClick={(clickEvent) => {
                stopPopupAction(clickEvent);
                setSelectedEvent(event);
              }}
            >
              <span>{formatPopupDate(event.date, event.time)}</span>
              <strong>{event.name}</strong>
            </button>
            <a href={event.url} target="_blank" rel="noreferrer">
              Tickets
            </a>
          </div>
        ))}
      </div>
    </>
  );
}

const getVenueGroups = (events: LocalEvent[]) =>
  Array.from(
    events.reduce((groups, event) => {
      const key = getEventLocationKey(event);
      const existing = groups.get(key);

      if (existing) {
        existing.events.push(event);
        return groups;
      }

      groups.set(key, {
        key,
        venueName: event.venue.name,
        latitude: event.venue.latitude,
        longitude: event.venue.longitude,
        events: [event],
      });
      return groups;
    }, new Map<string, VenueEventGroup>()),
  ).map(([, group]) => ({
    ...group,
    events: group.events
      .slice()
      .sort((a, b) => getEventDateValue(a) - getEventDateValue(b)),
  }));

const createVenueIcon = (eventCount: number, isSelected: boolean) =>
  L.divIcon({
    className: "sync-map-marker-shell",
    html:
      eventCount > 1
        ? `<span class="sync-map-marker is-group${
            isSelected ? " is-selected" : ""
          }"><i class="bi bi-building"></i><span class="sync-map-marker-count">${eventCount}</span></span>`
        : `<span class="sync-map-marker is-single${
            isSelected ? " is-selected" : ""
          }"><i class="bi bi-music-note-beamed"></i></span>`,
    iconSize: eventCount > 1 ? [48, 48] : [36, 42],
    iconAnchor: eventCount > 1 ? [24, 24] : [18, 38],
    popupAnchor: [0, -18],
  });

const formatPopupDate = (date?: string, time?: string) => {
  if (!date) return "Date TBA";
  const parsedDate = new Date(`${date}T${time ?? "00:00:00"}`);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: time ? "numeric" : undefined,
    minute: time ? "2-digit" : undefined,
  });
};

const getEventDateValue = (event: LocalEvent) => {
  if (!event.date) return Number.MAX_SAFE_INTEGER;
  const parsedDate = new Date(`${event.date}T${event.time ?? "00:00:00"}`);
  return Number.isNaN(parsedDate.getTime())
    ? Number.MAX_SAFE_INTEGER
    : parsedDate.getTime();
};

const stopPopupPropagation = (event: MouseEvent<HTMLElement>) => {
  event.stopPropagation();
};

const stopPopupAction = (event: MouseEvent<HTMLElement>) => {
  event.preventDefault();
  event.stopPropagation();
};
