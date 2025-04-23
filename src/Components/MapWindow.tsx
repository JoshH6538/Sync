import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLng } from "leaflet";
import L from "leaflet";
import { useState, useEffect, useRef } from "react";
import LocalEvent from "../LocalEventClass";
import userIconUrl from "/Images/TempUserIcon.png";
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
}
// ICONS
// Defines User ICON
const userIcon = L.icon({
  iconUrl: userIconUrl,
  iconSize: [25, 25],
  className: "leaflet-user-icon",
});

function LocationMarker() {
  const [position, setPosition] = useState<LatLng>(new LatLng(0, 0));

  // MAP FUNCTIONS
  const map = useMapEvents({
    // On map click, go to user
    click() {
      map.locate();
    },
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, 10);
    },
  });
  return position === null ? null : (
    <Marker position={position} icon={userIcon}>
      <Popup>You are here!</Popup>
    </Marker>
  );
}

function Refresh({ mapLat, mapLong }: Props) {
  const map = useMap();
  map.invalidateSize();
  map.setView([mapLat, mapLong], map.getZoom());
  return null;
}

let Map = ({
  mapLat,
  mapLong,
  events,
  selectedCoordinates,
  selectedID,
}: Props) => {
  // Stores refs w/ event id
  const popupRefs = useRef<{ [key: string]: any }>({});

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
        map.flyTo(coordinates, map.getZoom(), { duration: 1 });
        if (id && popupRefs.current[id]) {
          popupRefs.current[id].openOn(map);
        }
      }
    }, [coordinates, map, id]);
    return null;
  }

  return (
    <div className="map-container">
      <MapContainer center={[mapLat, mapLong]} zoom={8} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker />
        <Refresh mapLat={mapLat} mapLong={mapLong} events={events} />

        {events.map((event: LocalEvent) => (
          <Marker
            key={event.id}
            position={[event.venue.latitude, event.venue.longitude]}
          >
            <Popup
              className="pop-up"
              ref={(el) => {
                if (el) {
                  popupRefs.current[event.id] = el;
                }
              }}
            >
              {event.name}
              <br />
              <img className="marker-img" alt="Event" src={event.image} />
              <br />
              {event.venue.name}, {event.distance} miles away
            </Popup>
          </Marker>
        ))}

        {selectedCoordinates && (
          <CenterOnEvent coordinates={selectedCoordinates} id={selectedID} />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
