import {
  getTicketmasterGenreByName,
  getTicketmasterGenreMapping,
} from "./ticketmasterGenreMapping";
import {
  SpotifyTimeRange,
  SpotifyUserSummary,
  TasteArtist,
  TasteEdge,
  TasteProfile,
  TasteProfileSource,
  TasteTrack,
  WeightedBroadGenre,
  WeightedSubgenre,
} from "../types/taste";

const MIN_RANK_WEIGHT = 0.25;
const PRIMARY_ARTIST_TRACK_SUPPORT = 0.35;
const SECONDARY_ARTIST_TRACK_SUPPORT = 0.2;
const TRACK_GENRE_SUPPORT = 0.25;
const UNMAPPED_BROAD_GENRE = "unmapped";

type SpotifyImage = {
  url?: string;
};

type SpotifyExternalUrls = {
  spotify?: string;
};

export type SpotifyTasteUserInput = {
  id: string;
  name: string;
  image: string;
  url: string;
};

export type SpotifyArtistInput = {
  id: string;
  name: string;
  external_urls?: SpotifyExternalUrls;
  images?: SpotifyImage[];
  genres?: string[];
  popularity?: number;
};

export type SpotifyTrackInput = {
  id: string;
  name: string;
  external_urls?: SpotifyExternalUrls;
  images?: SpotifyImage[];
  popularity?: number;
  duration_ms?: number;
  album?: {
    id?: string;
    name?: string;
    images?: SpotifyImage[];
    release_date?: string;
    release_date_precision?: string;
  };
  artists?: {
    id: string;
    name: string;
  }[];
};

type BuildTasteProfileArgs = {
  user: SpotifyTasteUserInput;
  artists: SpotifyArtistInput[];
  tracks: SpotifyTrackInput[];
  source: {
    scopes: string[];
    artistTimeRange: SpotifyTimeRange;
    trackTimeRange: SpotifyTimeRange;
    artistLimit: number;
    trackLimit: number;
  };
};

type WeightedEntity = {
  weight: number;
};

type GenreAccumulator = {
  id: string;
  nodeId: string;
  name: string;
  source: "spotify";
  weight: number;
  artistIds: Set<string>;
  trackIds: Set<string>;
};

type BroadGenreAccumulator = {
  id: string;
  nodeId: string;
  name: string;
  ticketmasterGenreId?: string;
  weight: number;
  spotifyGenreNames: Set<string>;
  artistIds: Set<string>;
  trackIds: Set<string>;
};

export const buildTasteProfile = ({
  user,
  artists,
  tracks,
  source,
}: BuildTasteProfileArgs): TasteProfile => {
  const tasteSource: TasteProfileSource = {
    provider: "spotify",
    scopes: source.scopes,
    artistTimeRange: source.artistTimeRange,
    trackTimeRange: source.trackTimeRange,
    artistLimit: source.artistLimit,
    trackLimit: source.trackLimit,
  };

  const profileUser: SpotifyUserSummary = {
    id: user.id,
    name: user.name,
    imageUrl: user.image,
    spotifyUrl: user.url,
  };

  const tasteTracks = normalizeWeights(
    tracks.map((track, index) => buildTasteTrack(track, index, tracks.length)),
  );
  const trackSupportByArtist = getTrackSupportByArtist(tasteTracks);
  const tasteArtists = normalizeWeights(
    artists.map((artist, index) =>
      buildTasteArtist(
        artist,
        index,
        artists.length,
        trackSupportByArtist.get(artist.id) ?? 0,
      ),
    ),
  );

  // lookup map to find weighted artist data from id
  const artistById = new Map(tasteArtists.map((artist) => [artist.id, artist]));

  // relationship edges between artists, tracks, and genres
  const edges: TasteEdge[] = [];

  const genreMap = new Map<string, GenreAccumulator>();

  /**
   * For each top artist, take their Spotify genres.
   * Split the artist’s importance across those genres.
   * Add those genre scores up.
   * Create artist-to-genre links for the Taste Map.
   */
  tasteArtists.forEach((artist) => {
    // normalize genre names
    const genresForArtist = artist.genres
      .map(normalizeGenreName)
      .filter(Boolean);
    // split artist weight evenly across genres (if any) for genre weighting and edge creation
    const genreShare =
      genresForArtist.length > 0 ? artist.weight / genresForArtist.length : 0;

    genresForArtist.forEach((genreName) => {
      // add the genre contribution from this artist to the genre accumulator, creating if it doesn't exist yet
      const genre = getGenreAccumulator(genreMap, genreName);
      genre.weight += genreShare;
      genre.artistIds.add(artist.id);
      // create edge from artist to genre with weight equal to the artist's weight divided by their number of genres
      edges.push({
        id: edgeId(artist.nodeId, genre.nodeId, "artist_has_genre"),
        from: artist.nodeId,
        to: genre.nodeId,
        type: "artist_has_genre",
        weight: genreShare,
      });
    });
  });

  /**
   * For each top track, connect it to the artists credited on the track.
   * Give the main artist more support than featured artists.
   *
   * If a track artist is also in the user's top artists list,
   * use that artist's Spotify genres to reinforce the genre profile.
   *
   * Split part of the track's importance across that artist's genres.
   * Add those genre scores up.
   * Create track-to-genre links for the Taste Map.
   *
   * Current limitation:
   * Tracks only support genres when the track artist is also in the top artists list.
   */
  tasteTracks.forEach((track) => {
    track.artists.forEach((trackArtist, index) => {
      edges.push({
        id: edgeId(track.nodeId, trackArtist.nodeId, "track_by_artist"),
        from: track.nodeId,
        to: trackArtist.nodeId,
        type: "track_by_artist",
        weight:
          track.weight *
          (index === 0
            ? PRIMARY_ARTIST_TRACK_SUPPORT
            : SECONDARY_ARTIST_TRACK_SUPPORT),
      });

      const matchedArtist = artistById.get(trackArtist.id);
      if (!matchedArtist) return;

      const genresForArtist = matchedArtist.genres
        .map(normalizeGenreName)
        .filter(Boolean);
      const genreShare =
        genresForArtist.length > 0
          ? (track.weight * TRACK_GENRE_SUPPORT) / genresForArtist.length
          : 0;

      genresForArtist.forEach((genreName) => {
        const genre = getGenreAccumulator(genreMap, genreName);
        genre.weight += genreShare;
        genre.trackIds.add(track.id);
        edges.push({
          id: edgeId(track.nodeId, genre.nodeId, "track_supports_genre"),
          from: track.nodeId,
          to: genre.nodeId,
          type: "track_supports_genre",
          weight: genreShare,
        });
      });
    });
  });

  /**
   * Convert the accumulated genre map into a normal array.
   * Keep each genre's total weight.
   * Keep which artists and tracks contributed to that genre.
   * Normalize the weights so the strongest genre is 1.
   */
  const genres = normalizeWeights(
    Array.from(genreMap.values()).map((genre) => ({
      id: genre.id,
      nodeId: genre.nodeId,
      name: genre.name,
      source: genre.source,
      weight: genre.weight,
      artistIds: Array.from(genre.artistIds),
      trackIds: Array.from(genre.trackIds),
    })),
  );

  /**
   * For each Spotify genre, find the closest Ticketmaster genre/subgenre mapping.
   * Preserve the Spotify genre data.
   * Add Ticketmaster IDs when a mapping exists.
   * Add the broad genre group this Spotify genre belongs to.
   * Normalize mapped subgenre weights.
   */
  const subgenres = normalizeWeights(
    genres.map((genre) => {
      const mapping = getGenreMapping(genre.name);
      return {
        ...genre,
        ticketmasterGenreId: mapping.ticketmasterGenreId,
        ticketmasterSubGenreId: mapping.ticketmasterSubGenreId,
        broadGenreName: mapping.broadGenreName,
      };
    }),
  );

  const broadGenres = buildBroadGenres(subgenres, edges);

  return {
    generatedAt: new Date().toISOString(),
    source: tasteSource,
    user: profileUser,
    artists: tasteArtists,
    tracks: tasteTracks,
    genres,
    subgenres,
    broadGenres,
    edges,
  };
};

export const calculateRankWeight = (rank: number, limit: number) => {
  if (limit <= 1) return 1;

  const zeroBasedRank = Math.max(rank - 1, 0);
  return 1 - (zeroBasedRank / limit) * (1 - MIN_RANK_WEIGHT);
};

export const normalizeWeights = <T extends WeightedEntity>(items: T[]): T[] => {
  const maxWeight = Math.max(...items.map((item) => item.weight), 0);
  if (maxWeight <= 0) return items;

  return items.map((item) => ({
    ...item,
    weight: item.weight / maxWeight,
  }));
};

export const normalizeGenreName = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, " ");

const buildTasteArtist = (
  artist: SpotifyArtistInput,
  index: number,
  limit: number,
  trackSupport: number,
): TasteArtist => {
  const rank = index + 1;
  const rankWeight = calculateRankWeight(rank, limit);

  return {
    id: artist.id,
    nodeId: spotifyArtistNodeId(artist.id),
    name: artist.name,
    spotifyUrl: artist.external_urls?.spotify ?? "",
    imageUrl: artist.images?.[0]?.url ?? "Images/placeholder.jpg",
    rank,
    popularity: artist.popularity ?? null,
    genres: artist.genres ?? [],
    weight: rankWeight + trackSupport,
    weightParts: {
      rank: rankWeight,
      trackSupport,
    },
  };
};

const buildTasteTrack = (
  track: SpotifyTrackInput,
  index: number,
  limit: number,
): TasteTrack => {
  const rank = index + 1;
  const rankWeight = calculateRankWeight(rank, limit);

  return {
    id: track.id,
    nodeId: spotifyTrackNodeId(track.id),
    name: track.name,
    spotifyUrl: track.external_urls?.spotify ?? "",
    imageUrl: track.album?.images?.[0]?.url ?? track.images?.[0]?.url ?? "",
    rank,
    popularity: track.popularity ?? null,
    durationMs: track.duration_ms ?? null,
    album: {
      id: track.album?.id ?? "",
      name: track.album?.name ?? "",
      releaseDate: track.album?.release_date ?? null,
      releaseDatePrecision: track.album?.release_date_precision ?? null,
    },
    artists:
      track.artists?.map((artist) => ({
        id: artist.id,
        nodeId: spotifyArtistNodeId(artist.id),
        name: artist.name,
      })) ?? [],
    weight: rankWeight,
    weightParts: {
      rank: rankWeight,
    },
  };
};

const getTrackSupportByArtist = (tracks: TasteTrack[]) => {
  const support = new Map<string, number>();

  tracks.forEach((track) => {
    track.artists.forEach((artist, index) => {
      const multiplier =
        index === 0
          ? PRIMARY_ARTIST_TRACK_SUPPORT
          : SECONDARY_ARTIST_TRACK_SUPPORT;
      support.set(
        artist.id,
        (support.get(artist.id) ?? 0) + track.weight * multiplier,
      );
    });
  });

  return support;
};

const getGenreAccumulator = (
  genreMap: Map<string, GenreAccumulator>,
  genreName: string,
) => {
  const id = `spotify:genre:${genreName}`;
  const existingGenre = genreMap.get(id);
  if (existingGenre) return existingGenre;

  const genre: GenreAccumulator = {
    id,
    nodeId: id,
    name: genreName,
    source: "spotify",
    weight: 0,
    artistIds: new Set<string>(),
    trackIds: new Set<string>(),
  };
  genreMap.set(id, genre);
  return genre;
};

const getGenreMapping = (genreName: string) => {
  const mapping = getTicketmasterGenreMapping(genreName);

  return {
    ticketmasterGenreId: mapping.ticketmasterGenreId,
    ticketmasterSubGenreId: mapping.ticketmasterSubGenreId,
    broadGenreName: mapping.broadGenreName ?? UNMAPPED_BROAD_GENRE,
  };
};

/**
 * Builds broad genre groups from the weighted Spotify subgenres.
 *
 * Each subgenre has already been mapped, when possible, to a broader
 * Ticketmaster genre family. This function rolls those detailed subgenres
 * up into broader genre buckets so the TasteProfile can describe both:
 * - specific Spotify genre/subgenre signals
 * - higher-level genre families used for summary and discovery
 *
 * While grouping, this also:
 * - sums subgenre weights into each broad genre
 * - preserves which Spotify genre names contributed to the broad genre
 * - preserves contributing artist and track IDs
 * - adds Taste Map edges from Spotify genres to broad genres
 * - adds Taste Map edges from Spotify genres to Ticketmaster subgenre IDs
 *   when a Ticketmaster subgenre mapping exists
 *
 * The returned broad genres are normalized so the strongest broad genre
 * has a weight of 1.
 *
 * @param subgenres Weighted Spotify genres enriched with Ticketmaster mapping data.
 * @param edges Mutable TasteProfile edge list. This function appends genre mapping edges.
 * @returns Normalized broad genre groups for the TasteProfile.
 */
const buildBroadGenres = (
  subgenres: WeightedSubgenre[],
  edges: TasteEdge[],
): WeightedBroadGenre[] => {
  const broadGenreMap = new Map<string, BroadGenreAccumulator>();

  subgenres.forEach((subgenre) => {
    const broadGenreName = subgenre.broadGenreName ?? UNMAPPED_BROAD_GENRE;
    const ticketmasterGenreId = getTicketmasterGenreByName(broadGenreName);
    const broadGenre = getBroadGenreAccumulator(
      broadGenreMap,
      broadGenreName,
      ticketmasterGenreId,
    );

    broadGenre.weight += subgenre.weight;
    broadGenre.spotifyGenreNames.add(subgenre.name);
    subgenre.artistIds.forEach((artistId) =>
      broadGenre.artistIds.add(artistId),
    );
    subgenre.trackIds.forEach((trackId) => broadGenre.trackIds.add(trackId));

    edges.push({
      id: edgeId(
        subgenre.nodeId,
        broadGenre.nodeId,
        "spotify_genre_maps_to_broad_genre",
      ),
      from: subgenre.nodeId,
      to: broadGenre.nodeId,
      type: "spotify_genre_maps_to_broad_genre",
      weight: subgenre.weight,
    });

    if (!subgenre.ticketmasterSubGenreId) return;

    edges.push({
      id: edgeId(
        subgenre.nodeId,
        `ticketmaster:subgenre:${subgenre.ticketmasterSubGenreId}`,
        "spotify_genre_maps_to_ticketmaster_subgenre",
      ),
      from: subgenre.nodeId,
      to: `ticketmaster:subgenre:${subgenre.ticketmasterSubGenreId}`,
      type: "spotify_genre_maps_to_ticketmaster_subgenre",
      weight: subgenre.weight,
    });
  });

  return normalizeWeights(
    Array.from(broadGenreMap.values()).map((broadGenre) => ({
      id: broadGenre.id,
      nodeId: broadGenre.nodeId,
      name: broadGenre.name,
      ticketmasterGenreId: broadGenre.ticketmasterGenreId,
      weight: broadGenre.weight,
      spotifyGenreNames: Array.from(broadGenre.spotifyGenreNames),
      artistIds: Array.from(broadGenre.artistIds),
      trackIds: Array.from(broadGenre.trackIds),
    })),
  );
};

const getBroadGenreAccumulator = (
  broadGenreMap: Map<string, BroadGenreAccumulator>,
  name: string,
  ticketmasterGenreId?: string,
) => {
  const id = `spotify:broad-genre:${name}`;
  const existingBroadGenre = broadGenreMap.get(id);
  if (existingBroadGenre) return existingBroadGenre;

  const broadGenre: BroadGenreAccumulator = {
    id,
    nodeId: id,
    name,
    ticketmasterGenreId,
    weight: 0,
    spotifyGenreNames: new Set<string>(),
    artistIds: new Set<string>(),
    trackIds: new Set<string>(),
  };
  broadGenreMap.set(id, broadGenre);
  return broadGenre;
};

const edgeId = (from: string, to: string, type: TasteEdge["type"]) =>
  `${type}:${from}->${to}`;

const spotifyArtistNodeId = (id: string) => `spotify:artist:${id}`;

const spotifyTrackNodeId = (id: string) => `spotify:track:${id}`;
