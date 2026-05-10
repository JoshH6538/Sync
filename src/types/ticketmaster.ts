export type TicketmasterQueryPlan = {
  generatedAt: string;
  sourceTasteProfileGeneratedAt: string;
  requestBudget: TicketmasterRequestBudget;
  attractionSearches: TicketmasterAttractionSearchPlan[];
  classificationSearches: TicketmasterClassificationSearchPlan[];
  keywordSearches: TicketmasterKeywordSearchPlan[];
  debug: TicketmasterQueryPlanDebug;
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

