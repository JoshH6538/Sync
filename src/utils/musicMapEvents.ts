import LocalEvent from "../LocalEventClass";

export const getEventLocationKey = (event: LocalEvent) =>
  [
    normalizeKeyPart(event.venue.name),
    roundCoordinate(event.venue.latitude),
    roundCoordinate(event.venue.longitude),
  ].join("|");

export const getEventFamilyKey = (event: LocalEvent) =>
  normalizeKeyPart(event.name)
    .replace(/\b(live|tickets|concert|show)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const getEventListGroupKey = (event: LocalEvent) =>
  [getEventLocationKey(event), getEventFamilyKey(event)].join("::");

const normalizeKeyPart = (value: string) =>
  value
    .trim()
    .replace(/[^\w\s&'-]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

const roundCoordinate = (value: number) => value.toFixed(4);
