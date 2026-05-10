import TicketmasterMusicGenres from "../data/ticketmaster/genres";
import TicketmasterMusicSubgenres from "../data/ticketmaster/subgenres";

type TicketmasterAliasTarget = {
  targetName: string;
  broadGenreName?: string;
};

export type TicketmasterGenreMapping = {
  sourceName: string;
  normalizedSourceName: string;
  matchedName?: string;
  ticketmasterGenreId?: string;
  ticketmasterSubGenreId?: string;
  broadGenreName?: string;
  matchType: "exact" | "alias" | "heuristic" | "none";
};

const SPOTIFY_GENRE_ALIASES: Record<string, TicketmasterAliasTarget> = {
  rap: { targetName: "Hip-Hop/Rap", broadGenreName: "hip-hop/rap" },
  "hip hop": { targetName: "Hip-Hop/Rap", broadGenreName: "hip-hop/rap" },
  "hip-hop": { targetName: "Hip-Hop/Rap", broadGenreName: "hip-hop/rap" },
  "east coast hip hop": {
    targetName: "East Coast Rap",
    broadGenreName: "hip-hop/rap",
  },
  "east coast hip-hop": {
    targetName: "East Coast Rap",
    broadGenreName: "hip-hop/rap",
  },
  "west coast hip hop": {
    targetName: "West Coast Rap",
    broadGenreName: "hip-hop/rap",
  },
  "west coast hip-hop": {
    targetName: "West Coast Rap",
    broadGenreName: "hip-hop/rap",
  },
  "southern hip hop": {
    targetName: "Southern Rap",
    broadGenreName: "hip-hop/rap",
  },
  "southern hip-hop": {
    targetName: "Southern Rap",
    broadGenreName: "hip-hop/rap",
  },
  "jazz rap": { targetName: "Jazz-Rap", broadGenreName: "hip-hop/rap" },
  "soul blues": { targetName: "Soul-Blues", broadGenreName: "blues" },
  "vocal jazz": { targetName: "Vocal Jazz", broadGenreName: "jazz" },
};

export const normalizeTicketmasterKey = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

function normalizeMap(mapping: Record<string, string>) {
  return Object.entries(mapping).reduce<Record<string, string>>(
    (normalized, [name, id]) => {
      normalized[normalizeTicketmasterKey(name)] = id;
      return normalized;
    },
    {},
  );
}

const NORMALIZED_GENRES = normalizeMap(TicketmasterMusicGenres);
const NORMALIZED_SUBGENRES = normalizeMap(TicketmasterMusicSubgenres);
const BROAD_GENRE_NAMES = Object.keys(NORMALIZED_GENRES);

export const getTicketmasterGenreByName = (name: string) => {
  const normalizedName = normalizeTicketmasterKey(name);
  return NORMALIZED_GENRES[normalizedName];
};

export const getTicketmasterGenreMapping = (
  sourceName: string,
): TicketmasterGenreMapping => {
  const normalizedSourceName = normalizeTicketmasterKey(sourceName);
  const exactGenreId = NORMALIZED_GENRES[normalizedSourceName];
  const exactSubGenreId = NORMALIZED_SUBGENRES[normalizedSourceName];

  if (exactGenreId || exactSubGenreId) {
    return {
      sourceName,
      normalizedSourceName,
      matchedName: normalizedSourceName,
      ticketmasterGenreId: exactGenreId,
      ticketmasterSubGenreId: exactSubGenreId,
      broadGenreName: exactGenreId
        ? normalizedSourceName
        : inferBroadGenreName(normalizedSourceName),
      matchType: "exact",
    };
  }

  const aliasTarget = SPOTIFY_GENRE_ALIASES[normalizedSourceName];
  if (aliasTarget) {
    const normalizedTargetName = normalizeTicketmasterKey(
      aliasTarget.targetName,
    );
    return {
      sourceName,
      normalizedSourceName,
      matchedName: normalizedTargetName,
      ticketmasterGenreId:
        NORMALIZED_GENRES[normalizedTargetName] ??
        getTicketmasterGenreByName(aliasTarget.broadGenreName ?? ""),
      ticketmasterSubGenreId: NORMALIZED_SUBGENRES[normalizedTargetName],
      broadGenreName:
        aliasTarget.broadGenreName ?? inferBroadGenreName(normalizedTargetName),
      matchType: "alias",
    };
  }

  const broadGenreName = inferBroadGenreName(normalizedSourceName);
  if (broadGenreName) {
    return {
      sourceName,
      normalizedSourceName,
      matchedName: broadGenreName,
      ticketmasterGenreId: NORMALIZED_GENRES[broadGenreName],
      broadGenreName,
      matchType: "heuristic",
    };
  }

  return {
    sourceName,
    normalizedSourceName,
    matchType: "none",
  };
};

const inferBroadGenreName = (genreName: string) => {
  if (hasWholeTerm(genreName, "rap") || hasWholeTerm(genreName, "hip hop")) {
    return "hip-hop/rap";
  }

  const directBroadGenre = BROAD_GENRE_NAMES.find((broadGenreName) =>
    hasWholeTerm(genreName, broadGenreName),
  );

  return directBroadGenre;
};

const hasWholeTerm = (value: string, term: string) => {
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\W)${escapedTerm}(\\W|$)`).test(value);
};
