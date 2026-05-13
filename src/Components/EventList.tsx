import EventCard from "./EventCard";
import LocalEvent from "../LocalEventClass";
import {
  getEventListGroupKey,
  getEventLocationKey,
} from "../utils/musicMapEvents";
import { useEffect, useRef } from "react";

interface Props {
  events: LocalEvent[];
  onEventSelect: (
    lat: number,
    lng: number,
    id: string,
    venueKey: string,
  ) => void;
  selectedID?: string | null;
  selectedVenueKey?: string | null;
  shouldScrollToSelection?: boolean;
  layout?: "compact" | "grid";
  showTypeTags?: boolean;
}

export default function EventList({
  events,
  layout = "compact",
  onEventSelect,
  selectedID,
  selectedVenueKey,
  shouldScrollToSelection = false,
  showTypeTags = false,
}: Props) {
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const eventGroups = getEventGroups(events);

  useEffect(() => {
    if (!shouldScrollToSelection) return;
    const targetKey = selectedVenueKey ?? selectedID;
    if (!targetKey) return;
    itemRefs.current[targetKey]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [selectedID, selectedVenueKey, shouldScrollToSelection]);

  return (
    <div className={`event-list event-list-${layout}`}>
      {eventGroups.map((group, index) => {
        const event = group.events[0];
        const venueKey = getEventLocationKey(event);
        const groupKey = getEventListGroupKey(event);
        const isSelected =
          group.events.some((groupEvent) => groupEvent.id === selectedID) ||
          selectedVenueKey === venueKey;

        return (
          <div
            key={groupKey}
            ref={(node) => {
              group.events.forEach((groupEvent) => {
                itemRefs.current[groupEvent.id] = node;
              });
              itemRefs.current[groupKey] = node;
              if (isSelected) itemRefs.current[venueKey] = node;
            }}
          >
            <EventCard
              event={event}
              index={index}
              isSelected={isSelected}
              layout={layout}
              relatedEvents={group.events}
              showTypeTags={showTypeTags}
              onSelect={() =>
                onEventSelect(
                  event.venue.latitude,
                  event.venue.longitude,
                  event.id,
                  venueKey,
                )
              }
            />
          </div>
        );
      })}
    </div>
  );
}

type EventListGroup = {
  events: LocalEvent[];
};

const getEventGroups = (events: LocalEvent[]) =>
  Array.from(
    events.reduce((groups, event) => {
      const key = getEventListGroupKey(event);
      const existing = groups.get(key);

      if (existing) {
        existing.events.push(event);
        return groups;
      }

      groups.set(key, { events: [event] });
      return groups;
    }, new Map<string, EventListGroup>()),
  ).map(([, group]) => ({
    events: group.events
      .slice()
      .sort((a, b) => getEventDateValue(a) - getEventDateValue(b)),
  }));

const getEventDateValue = (event: LocalEvent) => {
  if (!event.date) return Number.MAX_SAFE_INTEGER;
  const parsedDate = new Date(`${event.date}T${event.time ?? "00:00:00"}`);
  return Number.isNaN(parsedDate.getTime())
    ? Number.MAX_SAFE_INTEGER
    : parsedDate.getTime();
};
