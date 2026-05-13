import { TasteArtist, TasteProfile, WeightedBroadGenre, WeightedSubgenre } from "../types/taste";
import { getTicketmasterGenreMapping } from "./ticketmasterGenreMapping";
import {
  TicketmasterAttractionSearchPlan,
  TicketmasterAttractionResolution,
  TicketmasterClassificationSearchPlan,
  TicketmasterEventSearchPlan,
  TicketmasterKeywordSearchPlan,
  TicketmasterQueryPlan,
  TicketmasterQueryPlanDebug,
  TicketmasterSkippedPlanItem,
  TicketmasterSuggestedSubgenreSearchPlan,
} from "../types/ticketmaster";

export type TicketmasterQueryPlanOptions = {
  defaultEventSearchRequestBudget: number;
  maxEventSearchRequestBudget: number;
  maxAttractionSearches: number;
  minAttractionArtistWeight: number;
  maxClassificationSearches: number;
  maxGenreIdsPerClassificationSearch: number;
  maxSubGenreIdsPerClassificationSearch: number;
  maxSuggestedSubGenres: number;
  minClassificationWeight: number;
  maxKeywordSearches: number;
  minKeywordGenreWeight: number;
};

export const DEFAULT_TICKETMASTER_QUERY_PLAN_OPTIONS: TicketmasterQueryPlanOptions = {
  defaultEventSearchRequestBudget: 2,
  maxEventSearchRequestBudget: 3,
  maxAttractionSearches: 3,
  minAttractionArtistWeight: 0.4,
  maxClassificationSearches: 2,
  maxGenreIdsPerClassificationSearch: 3,
  maxSubGenreIdsPerClassificationSearch: 12,
  maxSuggestedSubGenres: 12,
  minClassificationWeight: 0.25,
  maxKeywordSearches: 5,
  minKeywordGenreWeight: 0.35,
};

const MIN_SUGGESTED_BROAD_GENRE_WEIGHT = 0.12;

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
  const suggestedSubgenreSearches = buildSuggestedSubgenreSearches(
    tasteProfile,
    mergedOptions,
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
    suggestedSubgenreSearches,
    keywordSearches,
    debug,
  };
};

export const buildTicketmasterArtistEventSearchPlan = (
  queryPlan: TicketmasterQueryPlan,
  attractionResolutions: TicketmasterAttractionResolution[],
): TicketmasterEventSearchPlan | null => {
  const attractionIds = unique(
    attractionResolutions
      .filter((resolution) => resolution.status === "matched")
      .map((resolution) => resolution.attractionId)
      .filter((id): id is string => !!id),
  );

  if (attractionIds.length < 1) return null;

  return {
    kind: "artist",
    attractionIds,
    genreIds: [],
    subGenreIds: [],
    sourceSearchIds: queryPlan.attractionSearches
      .filter((search) =>
        attractionResolutions.some(
          (resolution) =>
            resolution.spotifyArtistId === search.artistId &&
            resolution.status === "matched",
        ),
      )
      .map((search) => search.id),
    matchedReasons: ["matched_attraction"],
  };
};

export const buildTicketmasterSuggestedEventSearchPlan = (
  queryPlan: TicketmasterQueryPlan,
  options: Partial<TicketmasterQueryPlanOptions> = {},
): TicketmasterEventSearchPlan | null => {
  const mergedOptions = {
    ...DEFAULT_TICKETMASTER_QUERY_PLAN_OPTIONS,
    ...options,
  };
  const classificationSearches = queryPlan.classificationSearches;
  const suggestedSubgenreSearches = queryPlan.suggestedSubgenreSearches.slice(
    0,
    mergedOptions.maxSuggestedSubGenres,
  );
  const subGenreIds = suggestedSubgenreSearches.map((search) => search.subGenreId);
  const genreIds =
    subGenreIds.length > 0
      ? []
      : unique(classificationSearches.flatMap((search) => search.genreIds));
  const keyword =
    subGenreIds.length < 1 &&
    genreIds.length < 1
      ? queryPlan.keywordSearches[0]?.keyword
      : undefined;

  if (subGenreIds.length < 1 && genreIds.length < 1 && !keyword) return null;

  return {
    kind: "suggested",
    attractionIds: [],
    genreIds,
    subGenreIds,
    keyword,
    sourceSearchIds: [
      ...suggestedSubgenreSearches.map((search) => search.id),
      ...classificationSearches.map((search) => search.id),
      ...(keyword ? [queryPlan.keywordSearches[0].id] : []),
    ],
    matchedReasons: [
      ...(subGenreIds.length > 0 ? ["specific_subgenre"] : []),
      ...(subGenreIds.length < 1 && genreIds.length > 0 ? ["broad_genre_fallback"] : []),
      ...(keyword ? ["keyword_fallback"] : []),
    ],
  };
};

const buildSuggestedSubgenreSearches = (
  tasteProfile: TasteProfile,
  options: TicketmasterQueryPlanOptions,
) => {
  const weightedSubgenreCandidates = dedupeSuggestedSubgenreCandidates(
    getSuggestedCandidatesFromWeightedSubgenres(tasteProfile.subgenres),
  );
  const diversifiedCandidates = getBroadGenreDiversifiedSuggestedCandidates(
    weightedSubgenreCandidates,
    tasteProfile.broadGenres,
    options.maxSuggestedSubGenres,
  );
  const fallbackCandidates = dedupeSuggestedSubgenreCandidates([
    ...weightedSubgenreCandidates,
    ...getSuggestedCandidatesFromArtists(tasteProfile.artists),
  ]);

  return fillSuggestedSubgenreFallbacks(
    diversifiedCandidates,
    fallbackCandidates,
    options.maxSuggestedSubGenres,
  ).map(toSuggestedSubgenreSearch);
};

const dedupeSuggestedSubgenreCandidates = (
  candidates: SuggestedSubgenreCandidate[],
) => {
  const candidatesBySubGenreId = new Map<string, SuggestedSubgenreCandidate>();

  candidates.forEach((candidate) => {
    const existing = candidatesBySubGenreId.get(candidate.subGenreId);
    if (existing && existing.weight >= candidate.weight) return;
    candidatesBySubGenreId.set(candidate.subGenreId, candidate);
  });

  return Array.from(candidatesBySubGenreId.values()).sort(sortByWeightDesc);
};

const getBroadGenreDiversifiedSuggestedCandidates = (
  candidates: SuggestedSubgenreCandidate[],
  broadGenres: WeightedBroadGenre[],
  maxSuggestedSubGenres: number,
) => {
  const candidatesByBroadGenre = groupSuggestedCandidatesByBroadGenre(candidates);
  const broadGenreAllocations = allocateBroadGenreSuggestedSlots(
    broadGenres,
    candidatesByBroadGenre,
    maxSuggestedSubGenres,
  );

  return broadGenreAllocations.flatMap((allocation) =>
    (candidatesByBroadGenre.get(allocation.broadGenreName) ?? [])
      .slice()
      .sort(sortByWeightDesc)
      .slice(0, allocation.slots),
  );
};

const groupSuggestedCandidatesByBroadGenre = (
  candidates: SuggestedSubgenreCandidate[],
) => {
  const candidatesByBroadGenre = new Map<string, SuggestedSubgenreCandidate[]>();

  candidates.forEach((candidate) => {
    if (!candidate.broadGenreName || candidate.broadGenreName === "unmapped") {
      return;
    }

    const group = candidatesByBroadGenre.get(candidate.broadGenreName) ?? [];
    group.push(candidate);
    candidatesByBroadGenre.set(candidate.broadGenreName, group);
  });

  return candidatesByBroadGenre;
};

type BroadGenreSuggestedSlotAllocation = {
  broadGenreName: string;
  slots: number;
};

const allocateBroadGenreSuggestedSlots = (
  broadGenres: WeightedBroadGenre[],
  candidatesByBroadGenre: Map<string, SuggestedSubgenreCandidate[]>,
  maxSuggestedSubGenres: number,
): BroadGenreSuggestedSlotAllocation[] => {
  const eligibleBroadGenres = broadGenres
    .filter((broadGenre) => broadGenre.name !== "unmapped")
    .filter((broadGenre) => broadGenre.weight >= MIN_SUGGESTED_BROAD_GENRE_WEIGHT)
    .filter((broadGenre) => (candidatesByBroadGenre.get(broadGenre.name)?.length ?? 0) > 0)
    .sort(sortByWeightDesc)
    .slice(0, maxSuggestedSubGenres);

  if (eligibleBroadGenres.length < 1) return [];

  const totalWeight = eligibleBroadGenres.reduce(
    (total, broadGenre) => total + broadGenre.weight,
    0,
  );
  if (totalWeight <= 0) return [];

  const allocations = eligibleBroadGenres.map((broadGenre) => {
    const candidateCount = candidatesByBroadGenre.get(broadGenre.name)?.length ?? 0;
    const rawSlots = (broadGenre.weight / totalWeight) * maxSuggestedSubGenres;
    const floorSlots = Math.floor(rawSlots);

    return {
      broadGenreName: broadGenre.name,
      weight: broadGenre.weight,
      remainder: rawSlots - floorSlots,
      slots: Math.min(candidateCount, Math.max(1, floorSlots)),
      candidateCount,
    };
  });

  let allocatedSlots = allocations.reduce(
    (total, allocation) => total + allocation.slots,
    0,
  );

  while (allocatedSlots < maxSuggestedSubGenres) {
    const nextAllocation = allocations
      .filter((allocation) => allocation.slots < allocation.candidateCount)
      .sort(
        (a, b) =>
          b.remainder - a.remainder ||
          b.weight - a.weight ||
          b.candidateCount - a.candidateCount,
      )[0];

    if (!nextAllocation) break;

    nextAllocation.slots += 1;
    allocatedSlots += 1;
  }

  while (allocatedSlots > maxSuggestedSubGenres) {
    const nextAllocation = allocations
      .filter((allocation) => allocation.slots > 1)
      .sort((a, b) => a.weight - b.weight || a.remainder - b.remainder)[0];

    if (!nextAllocation) break;

    nextAllocation.slots -= 1;
    allocatedSlots -= 1;
  }

  return allocations
    .filter((allocation) => allocation.slots > 0)
    .map((allocation) => ({
      broadGenreName: allocation.broadGenreName,
      slots: allocation.slots,
    }));
};

const fillSuggestedSubgenreFallbacks = (
  selectedCandidates: SuggestedSubgenreCandidate[],
  fallbackCandidates: SuggestedSubgenreCandidate[],
  maxSuggestedSubGenres: number,
) => {
  const selectedSubGenreIds = new Set(
    selectedCandidates.map((candidate) => candidate.subGenreId),
  );
  const candidates = [...selectedCandidates];

  for (const candidate of fallbackCandidates) {
    if (candidates.length >= maxSuggestedSubGenres) break;
    if (selectedSubGenreIds.has(candidate.subGenreId)) continue;

    selectedSubGenreIds.add(candidate.subGenreId);
    candidates.push(candidate);
  }

  return candidates.slice(0, maxSuggestedSubGenres);
};

const toSuggestedSubgenreSearch = (
  candidate: SuggestedSubgenreCandidate,
): TicketmasterSuggestedSubgenreSearchPlan => ({
  id: `ticketmaster:suggested-subgenre:${candidate.subGenreId}`,
  subGenreId: candidate.subGenreId,
  sourceGenreName: candidate.sourceGenreName,
  sourceNodeId: candidate.sourceNodeId,
  weight: candidate.weight,
});

type SuggestedSubgenreCandidate = {
  subGenreId: string;
  sourceGenreName: string;
  sourceNodeId: string;
  broadGenreName?: string;
  weight: number;
};

const getSuggestedCandidatesFromWeightedSubgenres = (
  subgenres: WeightedSubgenre[],
): SuggestedSubgenreCandidate[] =>
  subgenres.flatMap((subgenre) => {
    if (!subgenre.ticketmasterSubGenreId) return [];

    return [
      {
        subGenreId: subgenre.ticketmasterSubGenreId,
        sourceGenreName: subgenre.name,
        sourceNodeId: subgenre.nodeId,
        broadGenreName: subgenre.broadGenreName,
        weight: subgenre.trackIds.length > 0 ? subgenre.weight * 1.2 : subgenre.weight,
      },
    ];
  });

const getSuggestedCandidatesFromArtists = (
  artists: TasteArtist[],
): SuggestedSubgenreCandidate[] =>
  artists.flatMap((artist) =>
    artist.genres.flatMap((genre) => {
      const mapping = getTicketmasterGenreMapping(genre);
      if (!mapping.ticketmasterSubGenreId) return [];

      return [
        {
          subGenreId: mapping.ticketmasterSubGenreId,
          sourceGenreName: genre,
          sourceNodeId: artist.nodeId,
          broadGenreName: mapping.broadGenreName,
          weight:
            artist.weight *
            (artist.weightParts.trackSupport > 0 ? 1.15 : 1),
        },
      ];
    }),
  );

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
  const subgenreCandidates = getSubgenreClassificationCandidates(
    subgenres,
    options,
    debug,
  );
  const specificSubgenreCandidates = subgenreCandidates
    .filter((candidate) => candidate.subGenreId)
    .sort(sortByWeightDesc);
  const broadFallbackCandidates = [
    ...subgenreCandidates.filter((candidate) => !candidate.subGenreId && candidate.genreId),
    ...getBroadGenreClassificationCandidates(broadGenres, options, debug),
  ].sort(sortByWeightDesc);
  const candidates =
    specificSubgenreCandidates.length > 0
      ? specificSubgenreCandidates
      : broadFallbackCandidates;

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

const unique = <T>(items: T[]) => Array.from(new Set(items));

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
