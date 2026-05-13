import LocalEvent from "../LocalEventClass";
import "../Styles/EventCard.css";

type Props = {
  event: LocalEvent;
  index: number;
  isSelected: boolean;
  layout: "compact" | "grid";
  onSelect: () => void;
  relatedEvents?: LocalEvent[];
  showTypeTags: boolean;
};

export default function EventCard({
  event,
  index,
  isSelected,
  layout,
  onSelect,
  relatedEvents = [event],
  showTypeTags,
}: Props) {
  const tags = getRecommendationTags(event, showTypeTags);
  const location = [event.city, event.state].filter(Boolean).join(", ");
  const hasMultipleDates = relatedEvents.length > 1;

  return (
    <article
      className={`event-card event-card-${layout} ${
        isSelected ? "is-selected" : ""
      }`}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(eventKey) => {
        if (eventKey.key === "Enter" || eventKey.key === " ") {
          eventKey.preventDefault();
          onSelect();
        }
      }}
      aria-label={`Select event ${event.name}`}
    >
      <div className="event-card-rank">{index + 1}</div>
      <img
        src={event.image || "Images/placeholder.jpg"}
        className="event-card-img"
        alt={event.name}
      />
      <div className="event-card-body">
        <div>
          <div className="event-card-meta">
            <span>{formatEventDate(event.date, event.time)}</span>
            {Number.isFinite(event.distance) ? (
              <span>{Math.round(event.distance)} mi away</span>
            ) : null}
          </div>
          <h3>{event.name}</h3>
          <p>{event.venue.name}</p>
          {location ? <p>{location}</p> : null}
        </div>

        {hasMultipleDates ? (
          <div className="event-card-date-group" aria-label="Available dates">
            <small>{relatedEvents.length} available times</small>
            <div>
              {relatedEvents.map((dateEvent) => (
                <a
                  href={dateEvent.url}
                  target="_blank"
                  rel="noreferrer"
                  key={dateEvent.id}
                  onClick={(clickEvent) => clickEvent.stopPropagation()}
                >
                  {formatEventDate(dateEvent.date, dateEvent.time)}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {tags.genres.length > 0 || tags.types.length > 0 ? (
          <div className="event-card-tags" aria-label="Recommendation reasons">
            {tags.types.map((tag) => (
              <span className="event-tag-type" key={tag}>
                {tag}
              </span>
            ))}
            {tags.genres.length > 0 ? (
              <small>Because you listen to</small>
            ) : null}
            {tags.genres.map((tag) => (
              <span className="event-tag-genre" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <a
          href={event.url}
          target="_blank"
          rel="noreferrer"
          className="event-card-link"
          onClick={(clickEvent) => clickEvent.stopPropagation()}
        >
          View on Ticketmaster
        </a>
      </div>
    </article>
  );
}

const formatEventDate = (date?: string, time?: string) => {
  if (!date) return "Date TBA";

  const normalizedTime = time ? `T${time}` : "T00:00:00";
  const parsedDate = new Date(`${date}${normalizedTime}`);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: time ? "numeric" : undefined,
    minute: time ? "2-digit" : undefined,
  });
};

const getRecommendationTags = (event: LocalEvent, showTypeTags: boolean) => {
  const typeTags = new Set<string>();
  const genreTags = new Set<string>();

  event.recommendationMetadata?.forEach((metadata) => {
    if (metadata.recommendationLane === "artist") {
      if (showTypeTags) typeTags.add("Artist match");
      if (metadata.matchedArtistName) typeTags.add(metadata.matchedArtistName);
      return;
    }

    if (showTypeTags) typeTags.add("Taste match");
    metadata.sourceSpotifyGenreNames.forEach((genre) =>
      genreTags.add(toTitleCase(genre)),
    );
    metadata.matchedTicketmasterSubGenreNames.forEach((subgenre) => {
      genreTags.add(toTitleCase(subgenre));
    });
  });

  return {
    types: Array.from(typeTags).slice(0, 2),
    genres: Array.from(genreTags).slice(0, 4),
  };
};

const toTitleCase = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
