import EventCard from "./EventCard";
import LocalEvent from "../LocalEventClass";

interface Props {
  events: LocalEvent[];
  onEventSelect: (lat: number, lng: number, id: string) => void;
}

export default function EventList({ events, onEventSelect }: Props) {
  return (
    <div className="row g-3 event-list">
      <div className="col-12">
        {events.map((event: any, index: number) => (
          <div className="col-12 p-3" key={event.id}>
            <EventCard
              text={event.name}
              img={
                event.image.length > 0
                  ? event.image
                  : "src/Images/placeholder.jpg"
              }
              altnum={index}
              url={
                event.image.length > 0
                  ? event.url
                  : "https://joshh6538.github.io/Sync/MusicMap"
              }
              onClick={
                event.image.length > 0
                  ? () =>
                      onEventSelect(
                        event.venue.latitude,
                        event.venue.longitude,
                        event.id
                      )
                  : () => null
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
