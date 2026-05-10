import { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../Constants";
import { buildTasteProfile } from "../services/spotifyTasteProfile";
import { buildTicketmasterQueryPlan } from "../services/ticketmasterQueryPlan";
import { CACHE_TTLS, getCachedValue, setCachedValue } from "../services/cache";
import { SpotifyTimeRange, TasteProfile } from "../types/taste";
import { TicketmasterQueryPlan } from "../types/ticketmaster";

type User = { name: string; id: string; image: string; url: string };

const SPOTIFY_USER_CACHE_KEY = "sync:spotify:user:v1";
const getSpotifyTopArtistsCacheKey = (timeRange: string, limit: number) =>
  `sync:spotify:top-artists:${timeRange}:${limit}:v1`;
const getSpotifyTopTracksCacheKey = (timeRange: string, limit: number) =>
  `sync:spotify:top-tracks:${timeRange}:${limit}:v1`;
const getTasteProfileCacheKey = (
  artistRange: string,
  trackRange: string,
  artistLimit: number,
  trackLimit: number,
) =>
  `sync:taste-profile:${artistRange}:${trackRange}:${artistLimit}:${trackLimit}:v1`;

export const useSpotifyData = (token: string | null) => {
  const [artists, setArtists] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [tasteProfile, setTasteProfile] = useState<TasteProfile | null>(null);
  const [ticketmasterQueryPlan, setTicketmasterQueryPlan] =
    useState<TicketmasterQueryPlan | null>(null);

  const [user, setUser] = useState<User>(() => {
    const cached = sessionStorage.getItem("spotify_user");
    const cachedUser = getCachedValue<User>(SPOTIFY_USER_CACHE_KEY);
    return cached
      ? JSON.parse(cached)
      : (cachedUser ?? { name: "", id: "", image: "", url: "" });
  });

  /**
   * Clears user data from state and session storage on logout (token removal).
   */
  useEffect(() => {
    if (!token) {
      setUser({ name: "", id: "", image: "", url: "" });
      setTasteProfile(null);
      setTicketmasterQueryPlan(null);
      sessionStorage.removeItem("spotify_user");
    }
  }, [token]);

  const [artistCount, setArtistCount] = useState(20);
  const [trackCount, setTrackCount] = useState(20);
  const [artistTime, setArtistTime] = useState("short_term");
  const [trackTime, setTrackTime] = useState("short_term");

  /**
   * Fetches user profile data from Spotify API when token changes.
   */
  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      try {
        if (!token || user.id) return;

        const cachedUser = getCachedValue<User>(SPOTIFY_USER_CACHE_KEY);
        if (cachedUser) {
          setUser(cachedUser);
          sessionStorage.setItem("spotify_user", JSON.stringify(cachedUser));
          return;
        }

        const { data } = await axios.get("https://api.spotify.com/v1/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const newUser = {
          name: data.display_name,
          id: data.id,
          image: data.images?.[0]?.url || "Images/placeholder.jpg",
          url: data.external_urls.spotify,
        };

        setUser(newUser);
        sessionStorage.setItem("spotify_user", JSON.stringify(newUser));
        setCachedValue(SPOTIFY_USER_CACHE_KEY, newUser, CACHE_TTLS.spotifyUser);
      } catch (err) {
        console.error("[SpotifyData] User fetch error:", err);
      }
    };

    fetchUser();
  }, [token]);

  /**
   * Fetches top artists data from Spotify API when token, count, or time range changes.
   */
  useEffect(() => {
    if (!token) return;

    const fetchArtists = async () => {
      try {
        const cacheKey = getSpotifyTopArtistsCacheKey(artistTime, artistCount);
        const cachedArtists = getCachedValue<any[]>(cacheKey);
        if (cachedArtists) {
          setArtists(cachedArtists);
          setGenres(getGenresFromArtists(cachedArtists));
          return;
        }

        const { data } = await axios.get(
          `https://api.spotify.com/v1/me/top/artists?limit=${artistCount}&time_range=${artistTime}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setArtists(data.items);
        setCachedValue(cacheKey, data.items, CACHE_TTLS.spotifyTopItems);
        setGenres(getGenresFromArtists(data.items));
      } catch (err) {
        console.error("[SpotifyData] Artist fetch error:", err);
      }
    };

    fetchArtists();
  }, [token, artistCount, artistTime]);

  /**
   * Fetches top tracks data from Spotify API when token, count, or time range changes.
   */
  useEffect(() => {
    if (!token) return;

    const fetchTracks = async () => {
      try {
        const cacheKey = getSpotifyTopTracksCacheKey(trackTime, trackCount);
        const cachedTracks = getCachedValue<any[]>(cacheKey);
        if (cachedTracks) {
          setTracks(cachedTracks);
          return;
        }

        const { data } = await axios.get(
          `https://api.spotify.com/v1/me/top/tracks?limit=${trackCount}&time_range=${trackTime}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setTracks(data.items);
        setCachedValue(cacheKey, data.items, CACHE_TTLS.spotifyTopItems);
      } catch (err) {
        console.error("[SpotifyData] Track fetch error:", err);
      }
    };

    fetchTracks();
  }, [token, trackCount, trackTime]);

  /**
   * Builds a graph-compatible taste profile from the Spotify data already
   * fetched for the existing UI.
   */
  useEffect(() => {
    if (!token || !user.id || artists.length < 1 || tracks.length < 1) {
      setTasteProfile(null);
      return;
    }

    const cacheKey = getTasteProfileCacheKey(
      artistTime,
      trackTime,
      artistCount,
      trackCount,
    );
    const cachedProfile = getCachedValue<TasteProfile>(cacheKey);
    if (cachedProfile?.user.id === user.id) {
      setTasteProfile(cachedProfile);
      return;
    }

    const profile = buildTasteProfile({
      user,
      artists,
      tracks,
      source: {
        scopes: Constants.SCOPES,
        artistTimeRange: artistTime as SpotifyTimeRange,
        trackTimeRange: trackTime as SpotifyTimeRange,
        artistLimit: artistCount,
        trackLimit: trackCount,
      },
    });

    // console.group("TasteProfile Debug");

    // console.log("Full profile:", tasteProfile);

    // console.table(
    //   tasteProfile?.artists?.slice(0, 10).map((artist) => ({
    //     rank: artist.rank,
    //     name: artist.name,
    //     weight: artist.weight,
    //     rankWeight: artist.weightParts.rank,
    //     popularityBoost: artist.weightParts.popularity,
    //     trackSupport: artist.weightParts.trackSupport,
    //     genres: artist.genres.join(", "),
    //   })),
    // );

    // console.table(
    //   tasteProfile?.tracks?.slice(0, 10).map((track) => ({
    //     rank: track.rank,
    //     name: track.name,
    //     weight: track.weight,
    //     artists: track.artists.map((artist) => artist.name).join(", "),
    //     popularity: track.popularity,
    //   })),
    // );

    // console.table(
    //   tasteProfile?.subgenres?.slice(0, 20).map((genre) => ({
    //     name: genre.name,
    //     weight: genre.weight,
    //     ticketmasterGenreId: genre.ticketmasterGenreId,
    //     ticketmasterSubGenreId: genre.ticketmasterSubGenreId,
    //     broadGenreName: genre.broadGenreName,
    //     artistCount: genre.artistIds.length,
    //     trackCount: genre.trackIds.length,
    //   })),
    // );

    // console.table(
    //   tasteProfile?.broadGenres?.map((genre) => ({
    //     name: genre.name,
    //     weight: genre.weight,
    //     ticketmasterGenreId: genre.ticketmasterGenreId,
    //     sourceGenreCount: genre.spotifyGenreNames.length,
    //   })),
    // );

    // console.groupEnd();

    setTasteProfile(profile);
    setCachedValue(cacheKey, profile, CACHE_TTLS.tasteProfile);
  }, [
    token,
    user,
    artists,
    tracks,
    artistCount,
    trackCount,
    artistTime,
    trackTime,
  ]);

  /**
   * Builds an inspectable, low-request Ticketmaster query plan. This does not
   * call Ticketmaster or affect the current event search UI.
   */
  useEffect(() => {
    if (!tasteProfile) {
      setTicketmasterQueryPlan(null);
      return;
    }

    const plan = buildTicketmasterQueryPlan(tasteProfile);
    if (import.meta.env.DEV) {
      console.group("Ticketmaster QueryPlan Debug");

      console.log("Full plan:", plan);

      console.log("Request budget:", plan.requestBudget);

      console.table(
        plan.attractionSearches.map((search) => ({
          artist: search.artistName,
          keyword: search.keyword,
          weight: search.weight,
          reason: search.reason,
        })),
      );

      console.table(
        plan.classificationSearches.map((search) => ({
          genreIds: search.genreIds.join(", "),
          subGenreIds: search.subGenreIds.join(", "),
          sourceGenres: search.sourceGenreNames.join(", "),
          weight: search.weight,
          reason: search.reason,
        })),
      );

      console.table(
        plan.keywordSearches.map((search) => ({
          keyword: search.keyword,
          source: search.sourceName,
          weight: search.weight,
          reason: search.reason,
        })),
      );

      console.table(plan.debug.unmappedGenres);

      console.groupEnd();
    }

    setTicketmasterQueryPlan(plan);
  }, [tasteProfile]);

  return {
    user,
    artists,
    tracks,
    genres,
    tasteProfile,
    ticketmasterQueryPlan,
    artistCount,
    trackCount,
    artistTime,
    trackTime,
    setArtistCount,
    setTrackCount,
    setArtistTime,
    setTrackTime,
  };
};

const getGenresFromArtists = (artists: any[]) => {
  const genreList: string[] = [];
  artists.forEach((artist: any) =>
    artist.genres?.forEach((genre: string) => genreList.push(genre)),
  );
  return genreList;
};
