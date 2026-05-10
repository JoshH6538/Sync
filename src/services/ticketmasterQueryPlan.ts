import { TasteArtist, TasteProfile, WeightedBroadGenre, WeightedSubgenre } from "../types/taste";
import {
  TicketmasterAttractionSearchPlan,
  TicketmasterClassificationSearchPlan,
  TicketmasterKeywordSearchPlan,
  TicketmasterQueryPlan,
  TicketmasterQueryPlanDebug,
  TicketmasterSkippedPlanItem,
} from "../types/ticketmaster";

export type TicketmasterQueryPlanOptions = {
  defaultEventSearchRequestBudget: number;
  maxEventSearchRequestBudget: number;
  maxAttractionSearches: number;
  minAttractionArtistWeight: number;
  maxClassificationSearches: number;
  maxGenreIdsPerClassificationSearch: number;
  maxSubGenreIdsPerClassificationSearch: number;
  minClassificationWeight: number;
  maxKeywordSearches: number;
  minKeywordGenreWeight: number;
};

export const DEFAULT_TICKETMASTER_QUERY_PLAN_OPTIONS: TicketmasterQueryPlanOptions = {
  defaultEventSearchRequestBudget: 2,
  maxEventSearchRequestBudget: 3,
  maxAttractionSearches: 5,
  minAttractionArtistWeight: 0.4,
  maxClassificationSearches: 2,
  maxGenreIdsPerClassificationSearch: 8,
  maxSubGenreIdsPerClassificationSearch: 12,
  minClassificationWeight: 0.25,
  maxKeywordSearches: 5,
  minKeywordGenreWeight: 0.35,
};

type ClassificationCandidate = {
  sourceId: string;
  sourceNodeId: string;
  sourceName: string;
  genreId?: string;
  subGenreId?: string;
  weight: number;
  reason: TicketmasterClassificationSearchPlan["reason"];
};

type KeywordCandidate = {
  id: string;
  keyword: string;
  sourceNodeId: string;
  sourceName: string;
  weight: number;
  reason: TicketmasterKeywordSearchPlan["reason"];
};

export const buildTicketmasterQueryPlan = (
  tasteProfile: TasteProfile,
  options: Partial<TicketmasterQueryPlanOptions> = {},
): TicketmasterQueryPlan => {
  const mergedOptions = {
    ...DEFAULT_TICKETMASTER_QUERY_PLAN_OPTIONS,
    ...options,
  };
  const debug: TicketmasterQueryPlanDebug = {
    skippedArtists: [],
    skippedGenres: [],
    unmappedGenres: [],
  };

  const attractionSearches = buildAttractionSearches(
    tasteProfile.artists,
    mergedOptions,
    debug.skippedArtists,
  );
  const classificationSearches = buildClassificationSearches(
    tasteProfile.subgenres,
    tasteProfile.broadGenres,
    mergedOptions,
    debug,
  );
  const keywordSearches = buildKeywordSearches(
    tasteProfile.subgenres,
    tasteProfile.broadGenres,
    tasteProfile.artists,
    attractionSearches,
    mergedOptions,
    debug,
  );

  return {
    generatedAt: new Date().toISOString(),
    sourceTasteProfileGeneratedAt: tasteProfile.generatedAt,
    requestBudget: {
      defaultEventSearchRequests: mergedOptions.defaultEventSearchRequestBudget,
      maxEventSearchRequests: mergedOptions.maxEventSearchRequestBudget,
      strategy: "batched_classification_first",
    },
    attractionSearches,
    classificationSearches,
    keywordSearches,
    debug,
  };
};

const buildAttractionSearches = (
  artists: TasteArtist[],
  options: TicketmasterQueryPlanOptions,
  skippedArtists: TicketmasterSkippedPlanItem[],
) => {
  const searches: TicketmasterAttractionSearchPlan[] = [];
  const seenArtistNames = new Set<string>();

  artists
    .slice()
    .sort(sortByWeightDesc)
    .forEach((artist) => {
      const keyword = cleanKeyword(artist.name);
      const normalizedKeyword = normalizeSearchText(keyword);

      if (!keyword) {
        skippedArtists.push(toSkippedArtist(artist, "missing_or_unusable_name"));
        return;
      }

      if (artist.weight < options.minAttractionArtistWeight) {
        skippedArtists.push(toSkippedArtist(artist, "below_attraction_weight_threshold"));
        return;
      }

      if (seenArtistNames.has(normalizedKeyword)) {
        skippedArtists.push(toSkippedArtist(artist, "duplicate_artist_name"));
        return;
      }

      if (searches.length >= options.maxAttractionSearches) {
        skippedArtists.push(toSkippedArtist(artist, "over_attraction_candidate_cap"));
        return;
      }

      seenArtistNames.add(normalizedKeyword);
      searches.push({
        id: `ticketmaster:attraction-search:${normalizedKeyword}`,
        artistId: artist.id,
        artistName: artist.name,
        artistNodeId: artist.nodeId,
        keyword,
        weight: artist.weight,
        reason:
          artist.weightParts.trackSupport >= 0.2
            ? "track_supported_artist"
            : "top_artist",
      });
    });

  return searches;
};

const buildClassificationSearches = (
  subgenres: WeightedSubgenre[],
  broadGenres: WeightedBroadGenre[],
  options: TicketmasterQueryPlanOptions,
  debug: TicketmasterQueryPlanDebug,
) => {
  const candidates = [
    ...getSubgenreClassificationCandidates(subgenres, options, debug),
    ...getBroadGenreClassificationCandidates(broadGenres, options, debug),
  ].sort(sortByWeightDesc);

  const searches: TicketmasterClassificationSearchPlan[] = [];
  const usedGenreIds = new Set<string>();
  const usedSubGenreIds = new Set<string>();
  let cursor = 0;

  while (
    cursor < candidates.length &&
    searches.length < options.maxClassificationSearches
  ) {
    const batch = makeClassificationBatch(
      candidates.slice(cursor),
      usedGenreIds,
      usedSubGenreIds,
      options,
    );

    if (!batch) break;

    searches.push(batch.search);
    batch.genreIds.forEach((id) => usedGenreIds.add(id));
    batch.subGenreIds.forEach((id) => usedSubGenreIds.add(id));
    cursor += batch.consumedCandidates;
  }

  return searches;
};

const buildKeywordSearches = (
  subgenres: WeightedSubgenre[],
  broadGenres: WeightedBroadGenre[],
  artists: TasteArtist[],
  attractionSearches: TicketmasterAttractionSearchPlan[],
  options: TicketmasterQueryPlanOptions,
  debug: TicketmasterQueryPlanDebug,
) => {
  const candidates = [
    ...getUnmappedGenreKeywordCandidates(subgenres, options, debug),
    ...getBroadGenreFallbackKeywordCandidates(broadGenres, options, debug),
    ...getArtistFallbackKeywordCandidates(artists, attractionSearches, options),
  ].sort(sortByWeightDesc);

  const keywordSearches: TicketmasterKeywordSearchPlan[] = [];
  const seenKeywords = new Set<string>();

  candidates.forEach((candidate) => {
    if (keywordSearches.length >= options.maxKeywordSearches) return;

    const normalizedKeyword = normalizeSearchText(candidate.keyword);
    if (!normalizedKeyword || seenKeywords.has(normalizedKeyword)) return;

    seenKeywords.add(normalizedKeyword);
    keywordSearches.push({
      id: candidate.id,
      keyword: candidate.keyword,
      sourceNodeId: candidate.sourceNodeId,
      sourceName: candidate.sourceName,
      weight: candidate.weight,
      reason: candidate.reason,
    });
  });

  return keywordSearches;
};

const getSubgenreClassificationCandidates = (
  subgenres: WeightedSubgenre[],
  options: TicketmasterQueryPlanOptions,
  debug: TicketmasterQueryPlanDebug,
) =>
  subgenres.flatMap((subgenre): ClassificationCandidate[] => {
    if (subgenre.weight < options.minClassificationWeight) {
      debug.skippedGenres.push(
        toSkippedGenre(subgenre, "below_classification_weight_threshold"),
      );
      return [];
    }

    if (!subgenre.ticketmasterGenreId && !subgenre.ticketmasterSubGenreId) {
      debug.unmappedGenres.push({
        sourceId: subgenre.id,
        sourceNodeId: subgenre.nodeId,
        sourceName: subgenre.name,
        weight: subgenre.weight,
      });
      return [];
    }

    const candidates: ClassificationCandidate[] = [];

    if (subgenre.ticketmasterSubGenreId) {
      candidates.push({
        sourceId: subgenre.id,
        sourceNodeId: subgenre.nodeId,
        sourceName: subgenre.name,
        subGenreId: subgenre.ticketmasterSubGenreId,
        weight: subgenre.weight,
        reason: "mapped_subgenre",
      });
    }

    if (subgenre.ticketmasterGenreId) {
      candidates.push({
        sourceId: subgenre.id,
        sourceNodeId: subgenre.nodeId,
        sourceName: subgenre.name,
        genreId: subgenre.ticketmasterGenreId,
        weight: subgenre.weight,
        reason: "mapped_genre",
      });
    }

    return candidates;
  });

const getBroadGenreClassificationCandidates = (
  broadGenres: WeightedBroadGenre[],
  options: TicketmasterQueryPlanOptions,
  debug: TicketmasterQueryPlanDebug,
) =>
  broadGenres.flatMap((broadGenre): ClassificationCandidate[] => {
    if (broadGenre.weight < options.minClassificationWeight) {
      debug.skippedGenres.push(
        toSkippedBroadGenre(broadGenre, "below_classification_weight_threshold"),
      );
      return [];
    }

    if (!broadGenre.ticketmasterGenreId) return [];

    return [
      {
        sourceId: broadGenre.id,
        sourceNodeId: broadGenre.nodeId,
        sourceName: broadGenre.name,
        genreId: broadGenre.ticketmasterGenreId,
        weight: broadGenre.weight,
        reason: "broad_genre",
      },
    ];
  });

const makeClassificationBatch = (
  candidates: ClassificationCandidate[],
  usedGenreIds: Set<string>,
  usedSubGenreIds: Set<string>,
  options: TicketmasterQueryPlanOptions,
) => {
  const batchCandidates: ClassificationCandidate[] = [];
  const genreIds: string[] = [];
  const subGenreIds: string[] = [];
  const sourceGenreNames = new Set<string>();
  const sourceNodeIds = new Set<string>();

  for (const candidate of candidates) {
    const canAddGenre =
      candidate.genreId &&
      !usedGenreIds.has(candidate.genreId) &&
      !genreIds.includes(candidate.genreId) &&
      genreIds.length < options.maxGenreIdsPerClassificationSearch;
    const canAddSubGenre =
      candidate.subGenreId &&
      !usedSubGenreIds.has(candidate.subGenreId) &&
      !subGenreIds.includes(candidate.subGenreId) &&
      subGenreIds.length < options.maxSubGenreIdsPerClassificationSearch;

    if (!canAddGenre && !canAddSubGenre) continue;

    if (canAddGenre && candidate.genreId) genreIds.push(candidate.genreId);
    if (canAddSubGenre && candidate.subGenreId) subGenreIds.push(candidate.subGenreId);

    batchCandidates.push(candidate);
    sourceGenreNames.add(candidate.sourceName);
    sourceNodeIds.add(candidate.sourceNodeId);

    if (
      genreIds.length >= options.maxGenreIdsPerClassificationSearch &&
      subGenreIds.length >= options.maxSubGenreIdsPerClassificationSearch
    ) {
      break;
    }
  }

  if (batchCandidates.length < 1) return null;

  const reason = getBatchReason(batchCandidates);
  const weight =
    batchCandidates.reduce((total, candidate) => total + candidate.weight, 0) /
    batchCandidates.length;

  return {
    genreIds,
    subGenreIds,
    consumedCandidates: batchCandidates.length,
    search: {
      id: `ticketmaster:classification-search:${genreIds.join(",")}:${subGenreIds.join(",")}`,
      genreIds,
      subGenreIds,
      sourceGenreNames: Array.from(sourceGenreNames),
      sourceNodeIds: Array.from(sourceNodeIds),
      weight,
      reason,
    },
  };
};

const getUnmappedGenreKeywordCandidates = (
  subgenres: WeightedSubgenre[],
  options: TicketmasterQueryPlanOptions,
  debug: TicketmasterQueryPlanDebug,
) =>
  subgenres.flatMap((subgenre): KeywordCandidate[] => {
    if (subgenre.ticketmasterGenreId || subgenre.ticketmasterSubGenreId) return [];
    if (subgenre.weight < options.minKeywordGenreWeight) return [];

    const keyword = cleanKeyword(subgenre.name);
    if (!keyword) {
      debug.skippedGenres.push(toSkippedGenre(subgenre, "unusable_keyword"));
      return [];
    }

    return [
      {
        id: `ticketmaster:keyword-search:unmapped-genre:${normalizeSearchText(keyword)}`,
        keyword,
        sourceNodeId: subgenre.nodeId,
        sourceName: subgenre.name,
        weight: subgenre.weight,
        reason: "unmapped_genre",
      },
    ];
  });

const getBroadGenreFallbackKeywordCandidates = (
  broadGenres: WeightedBroadGenre[],
  options: TicketmasterQueryPlanOptions,
  debug: TicketmasterQueryPlanDebug,
) =>
  broadGenres.flatMap((broadGenre): KeywordCandidate[] => {
    if (broadGenre.ticketmasterGenreId) return [];
    if (broadGenre.name === "unmapped") return [];
    if (broadGenre.weight < options.minKeywordGenreWeight) return [];

    const keyword = cleanKeyword(broadGenre.name);
    if (!keyword) {
      debug.skippedGenres.push(toSkippedBroadGenre(broadGenre, "unusable_keyword"));
      return [];
    }

    return [
      {
        id: `ticketmaster:keyword-search:broad-genre:${normalizeSearchText(keyword)}`,
        keyword,
        sourceNodeId: broadGenre.nodeId,
        sourceName: broadGenre.name,
        weight: broadGenre.weight,
        reason: "broad_genre_fallback",
      },
    ];
  });

const getArtistFallbackKeywordCandidates = (
  artists: TasteArtist[],
  attractionSearches: TicketmasterAttractionSearchPlan[],
  options: TicketmasterQueryPlanOptions,
) => {
  const plannedAttractionArtistIds = new Set(
    attractionSearches.map((search) => search.artistId),
  );

  return artists.flatMap((artist): KeywordCandidate[] => {
    if (plannedAttractionArtistIds.has(artist.id)) return [];
    if (artist.weight < options.minAttractionArtistWeight) return [];

    const keyword = cleanKeyword(artist.name);
    if (!keyword) return [];

    return [
      {
        id: `ticketmaster:keyword-search:artist:${normalizeSearchText(keyword)}`,
        keyword,
        sourceNodeId: artist.nodeId,
        sourceName: artist.name,
        weight: artist.weight,
        reason: "artist_fallback",
      },
    ];
  });
};

const getBatchReason = (
  candidates: ClassificationCandidate[],
): TicketmasterClassificationSearchPlan["reason"] => {
  if (candidates.some((candidate) => candidate.reason === "mapped_subgenre")) {
    return "mapped_subgenre";
  }

  if (candidates.some((candidate) => candidate.reason === "mapped_genre")) {
    return "mapped_genre";
  }

  return "broad_genre";
};

const cleanKeyword = (keyword: string) => keyword.trim().replace(/\s+/g, " ");

const normalizeSearchText = (value: string) => cleanKeyword(value).toLowerCase();

const sortByWeightDesc = <T extends { weight: number }>(a: T, b: T) =>
  b.weight - a.weight;

const toSkippedArtist = (
  artist: TasteArtist,
  reason: string,
): TicketmasterSkippedPlanItem => ({
  sourceId: artist.id,
  sourceNodeId: artist.nodeId,
  sourceName: artist.name,
  reason,
});

const toSkippedGenre = (
  genre: WeightedSubgenre,
  reason: string,
): TicketmasterSkippedPlanItem => ({
  sourceId: genre.id,
  sourceNodeId: genre.nodeId,
  sourceName: genre.name,
  reason,
});

const toSkippedBroadGenre = (
  genre: WeightedBroadGenre,
  reason: string,
): TicketmasterSkippedPlanItem => ({
  sourceId: genre.id,
  sourceNodeId: genre.nodeId,
  sourceName: genre.name,
  reason,
});

