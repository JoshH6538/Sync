import MapWindow from "../Components/MapWindow";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Constants from "../Information/Constants";
import TicketmasterCredentials from "../Information/Credentials/TicketmasterCredentials";
import Subgenres from "../Subgenres";
import LocalEvent from "../LocalEventClass";
import LocalVenue from "../LocalVenueClass";
import EventList from "../Components/EventList";
import EventSettings from "../Components/EventSettings";
import SortOptions from "../SortOptions";
import "../Styles/MusicMap.css";

interface Props {
  genres: string[];
}

interface FormDataValues {
  radius: number;
  unit: string;
  sortObject: string;
  sortOrder: string;
}

export default function MusicMap({ genres }: Props) {
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
    if ((latitude === 0 && longitude === 0) || genreIds.length < 1 || fetched)
      return;

    let URL = `${Constants.EVENTS_BASE_URL}${TicketmasterCredentials.TICKET_KEY}&latlong=${latitude},${longitude}`;
    URL += `&radius=${radius >= 5 && radius <= 1000 ? radius : 100}`;
    URL += `&unit=${
      ["miles", "km"].includes(radiusUnit) ? radiusUnit : "miles"
    }`;
    URL +=
      SortOptions.has(sortObject) && SortOptions.has(sortOrder)
        ? `&sort=${sortObject},${sortOrder}`
        : `&sort=distance,asc`;
    URL += `&locale=*`;
    if (genreIds.length > 0) URL += `&subGenreId=${genreIds.join(",")}`;

    try {
      const { data } = await axios.get(URL);
      if (data.page.totalElements > 0) {
        const eventList: LocalEvent[] = data._embedded.events.map(
          (event: any) => {
            const venue = new LocalVenue(
              event._embedded.venues[0].name,
              event._embedded.venues[0].location.latitude,
              event._embedded.venues[0].location.longitude
            );
            return new LocalEvent(
              event.name,
              event.id,
              event.images[0].url,
              venue,
              event.distance,
              event.url
            );
          }
        );
        setEvents(eventList);
      } else {
        alert("No results found. Please adjust your search settings.");
      }
      setFetched(true);
    } catch (error) {
      console.error("Failed to fetch events:", error);
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
  }, [latitude, longitude, precision, genreIds]);

  useEffect(() => {
    setFetched(false);
  }, [radius, radiusUnit, sortObject, sortOrder]);

  useEffect(() => {
    if (!fetched) localEvents();
  }, [fetched]);

  useEffect(() => {
    const form = document.getElementById(
      "event-settings-form"
    ) as HTMLFormElement;
    const submitButton = document.getElementById(
      "event-settings-submit"
    ) as HTMLButtonElement;

    const handleSubmit = (event: Event) => {
      event.preventDefault();

      const radiusEl = document.getElementById("radius") as HTMLInputElement;
      const unitEl = document.getElementById("radiusUnit") as HTMLInputElement;
      const sObjectEl = document.getElementById(
        "sortObject"
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
