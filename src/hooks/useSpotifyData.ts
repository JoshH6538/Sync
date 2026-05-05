import { useEffect, useState } from "react";
import axios from "axios";

export const useSpotifyData = (token: string | null) => {
  const [artists, setArtists] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [genres, setGenres] = useState<string[]>([]);

  type User = { name: string; id: string; image: string; url: string };

  const [user, setUser] = useState<User>(() => {
    const cached = sessionStorage.getItem("spotify_user");
    return cached
      ? JSON.parse(cached)
      : { name: "", id: "", image: "", url: "" };
  });

  /**
   * Clears user data from state and session storage on logout (token removal).
   */
  useEffect(() => {
    if (!token) {
      setUser({ name: "", id: "", image: "", url: "" });
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
        const { data } = await axios.get(
          `https://api.spotify.com/v1/me/top/artists?limit=${artistCount}&time_range=${artistTime}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setArtists(data.items);

        const genreList: string[] = [];
        data.items.forEach((a: any) =>
          a.genres.forEach((g: string) => genreList.push(g)),
        );

        setGenres(genreList);
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
        const { data } = await axios.get(
          `https://api.spotify.com/v1/me/top/tracks?limit=${trackCount}&time_range=${trackTime}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setTracks(data.items);
      } catch (err) {
        console.error("[SpotifyData] Track fetch error:", err);
      }
    };

    fetchTracks();
  }, [token, trackCount, trackTime]);

  return {
    user,
    artists,
    tracks,
    genres,
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
