export type SpotifyTimeRange = "short_term" | "medium_term" | "long_term";

export type TasteProfile = {
  generatedAt: string;
  source: TasteProfileSource;
  user: SpotifyUserSummary;
  artists: TasteArtist[];
  tracks: TasteTrack[];
  genres: WeightedGenre[];
  subgenres: WeightedSubgenre[];
  broadGenres: WeightedBroadGenre[];
  edges: TasteEdge[];
};

export type TasteProfileSource = {
  provider: "spotify";
  scopes: string[];
  artistTimeRange: SpotifyTimeRange;
  trackTimeRange: SpotifyTimeRange;
  artistLimit: number;
  trackLimit: number;
};

export type SpotifyUserSummary = {
  id: string;
  name: string;
  imageUrl: string;
  spotifyUrl: string;
};

export type TasteArtist = {
  id: string;
  nodeId: string;
  name: string;
  spotifyUrl: string;
  imageUrl: string;
  rank: number;
  popularity: number | null;
  genres: string[];
  weight: number;
  weightParts: {
    rank: number;
    trackSupport: number;
  };
};

export type TasteTrack = {
  id: string;
  nodeId: string;
  name: string;
  spotifyUrl: string;
  imageUrl: string;
  rank: number;
  popularity: number | null;
  durationMs: number | null;
  album: {
    id: string;
    name: string;
    releaseDate: string | null;
    releaseDatePrecision: string | null;
  };
  artists: {
    id: string;
    nodeId: string;
    name: string;
  }[];
  weight: number;
  weightParts: {
    rank: number;
  };
};

export type WeightedGenre = {
  id: string;
  nodeId: string;
  name: string;
  source: "spotify";
  weight: number;
  artistIds: string[];
  trackIds: string[];
};

export type WeightedSubgenre = {
  id: string;
  nodeId: string;
  name: string;
  source: "spotify";
  ticketmasterSubGenreId?: string;
  ticketmasterGenreId?: string;
  broadGenreName?: string;
  weight: number;
  artistIds: string[];
  trackIds: string[];
};

export type WeightedBroadGenre = {
  id: string;
  nodeId: string;
  name: string;
  ticketmasterGenreId?: string;
  weight: number;
  spotifyGenreNames: string[];
  artistIds: string[];
  trackIds: string[];
};

export type TasteEdgeType =
  | "artist_has_genre"
  | "track_by_artist"
  | "track_supports_genre"
  | "spotify_genre_maps_to_broad_genre"
  | "spotify_genre_maps_to_ticketmaster_subgenre";

export type TasteEdge = {
  id: string;
  from: string;
  to: string;
  type: TasteEdgeType;
  weight: number;
};
