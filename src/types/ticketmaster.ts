export type TicketmasterQueryPlan = {
  generatedAt: string;
  sourceTasteProfileGeneratedAt: string;
  requestBudget: TicketmasterRequestBudget;
  attractionSearches: TicketmasterAttractionSearchPlan[];
  classificationSearches: TicketmasterClassificationSearchPlan[];
  suggestedSubgenreSearches: TicketmasterSuggestedSubgenreSearchPlan[];
  keywordSearches: TicketmasterKeywordSearchPlan[];
  debug: TicketmasterQueryPlanDebug;
};

export type TicketmasterEventSearchPlanKind = "artist" | "suggested";

export type TicketmasterEventSearchPlan = {
  kind: TicketmasterEventSearchPlanKind;
  attractionIds: string[];
  genreIds: string[];
  subGenreIds: string[];
  keyword?: string;
  sourceSearchIds: string[];
  matchedReasons: string[];
};

export type TicketmasterAttractionResolution = {
  spotifyArtistId: string;
  artistName: string;
  normalizedArtistName: string;
  status: "matched" | "no_match";
  attractionId?: string;
  attractionName?: string;
  matchType?: "spotify_external_link" | "exact" | "safe_near_exact";
};

export type TicketmasterRequestBudget = {
  defaultEventSearchRequests: number;
  maxEventSearchRequests: number;
  strategy: "batched_classification_first";
};

export type TicketmasterAttractionSearchPlan = {
  id: string;
  artistId: string;
  artistName: string;
  artistNodeId: string;
  keyword: string;
  weight: number;
  reason: "top_artist" | "track_supported_artist";
};

export type TicketmasterClassificationSearchPlan = {
  id: string;
  genreIds: string[];
  subGenreIds: string[];
  sourceGenreNames: string[];
  sourceNodeIds: string[];
  weight: number;
  reason: "mapped_genre" | "mapped_subgenre" | "broad_genre";
};

export type TicketmasterSuggestedSubgenreSearchPlan = {
  id: string;
  subGenreId: string;
  sourceGenreName: string;
  sourceNodeId: string;
  weight: number;
};

export type TicketmasterKeywordSearchPlan = {
  id: string;
  keyword: string;
  sourceNodeId: string;
  sourceName: string;
  weight: number;
  reason: "unmapped_genre" | "artist_fallback" | "broad_genre_fallback";
};

export type TicketmasterQueryPlanDebug = {
  skippedArtists: TicketmasterSkippedPlanItem[];
  skippedGenres: TicketmasterSkippedPlanItem[];
  unmappedGenres: TicketmasterUnmappedGenreDebugItem[];
};

export type TicketmasterSkippedPlanItem = {
  sourceId: string;
  sourceNodeId: string;
  sourceName: string;
  reason: string;
};

export type TicketmasterUnmappedGenreDebugItem = {
  sourceId: string;
  sourceNodeId: string;
  sourceName: string;
  weight: number;
};
