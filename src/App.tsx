// Style Imports
import "./Styles/App.css";

import { useEffect, useState, useRef } from "react";
import Navbar from "./Components/Navbar";
import About from "./Pages/About";
import Stats from "./Pages/Stats";
import MusicMap from "./Pages/MusicMap";
import PromptPage from "./Pages/PromptPage";
import Privacy from "./Pages/Privacy";
import Constants from "./Information/Constants";
import SpotifyCredentials from "./Information/Credentials/SpotifyCredentials";
import axios from "axios";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  const SCOPES_URL_PARAM = Constants.SCOPES.join(Constants.SPACE_DELIM);

  // ---------------- STATE ----------------
  const [token, setToken] = useState(sessionStorage.getItem("token") || "");

  const [artists, setArtists] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [genres, setGenres] = useState<string[]>([]);

  const [displayName, setDisplayName] = useState("");
  const [ID, setID] = useState("");
  const [displayPicture, setDisplayPicture] = useState("");
  const [userUrl, setUserUrl] = useState("");

  const [artistCount, setArtistCount] = useState(20);
  const [trackCount, setTrackCount] = useState(20);
  const [artistTime, setArtistTime] = useState("short_term");
  const [trackTime, setTrackTime] = useState("short_term");

  const hasFetched = useRef(false);

  const userInfo = {
    name: displayName,
    id: ID,
    image: displayPicture,
    url: userUrl,
  };

  // ---------------- PKCE HELPERS ----------------
  const generateRandomString = (length: number) => {
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map((x) => possible[x % possible.length])
      .join("");
  };

  const sha256 = async (plain: string) => {
    const encoder = new TextEncoder();
    return await crypto.subtle.digest("SHA-256", encoder.encode(plain));
  };

  const base64encode = (input: ArrayBuffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async () => {
    sessionStorage.removeItem("code_verifier");

    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    sessionStorage.setItem("code_verifier", codeVerifier);

    const redirect = "http://127.0.0.1:5173/Sync/";

    const location =
      Constants.SPOTIFY_AUTHORIZE_ENDPOINT +
      "?client_id=" +
      SpotifyCredentials.CLIENT_ID +
      "&response_type=code" +
      "&redirect_uri=" +
      encodeURIComponent(redirect) +
      "&scope=" +
      SCOPES_URL_PARAM +
      "&code_challenge_method=S256" +
      "&code_challenge=" +
      codeChallenge;

    window.location.href = location;
  };

  const handleLogout = () => {
    setToken("");
    setArtists([]);
    setTracks([]);
    setDisplayName("");
    setID("");
    sessionStorage.clear();
  };

  // ---------------- TOKEN EXCHANGE ----------------
  useEffect(() => {
    if (hasFetched.current) return;

    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) return;

    hasFetched.current = true;

    const fetchToken = async () => {
      try {
        const codeVerifier = sessionStorage.getItem("code_verifier");

        const body = new URLSearchParams({
          client_id: SpotifyCredentials.CLIENT_ID,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: "http://127.0.0.1:5173/Sync/",
          code_verifier: codeVerifier!,
        });

        const response = await axios.post(
          "https://accounts.spotify.com/api/token",
          body,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          },
        );

        const access_token = response.data.access_token;

        sessionStorage.setItem("token", access_token);
        setToken(access_token);

        window.history.replaceState({}, document.title, "/Sync/");
      } catch (err: any) {
        console.error("Token exchange failed:", err.response?.data || err);
      }
    };

    fetchToken();
  }, []);

  // ---------------- DATA FETCH ----------------
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const userRes = await axios.get("https://api.spotify.com/v1/me", {
          headers,
        });
        setDisplayName(userRes.data.display_name);
        setID(userRes.data.id);
        setDisplayPicture(
          userRes.data.images?.[0]?.url || "Images/placeholder.jpg",
        );
        setUserUrl(userRes.data.external_urls.spotify);

        const artistRes = await axios.get(
          `https://api.spotify.com/v1/me/top/artists?limit=${artistCount}&time_range=${artistTime}`,
          { headers },
        );
        setArtists(artistRes.data.items);

        const genreList: string[] = [];
        artistRes.data.items.forEach((a: any) =>
          a.genres.forEach((g: string) => genreList.push(g)),
        );

        setGenres(genreList);

        const trackRes = await axios.get(
          `https://api.spotify.com/v1/me/top/tracks?limit=${trackCount}&time_range=${trackTime}`,
          { headers },
        );
        setTracks(trackRes.data.items);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, [token, artistCount, trackCount, artistTime, trackTime]);

  // ---------------- HANDLERS ----------------
  const updateArtistCount = (count: number) => setArtistCount(count);
  const updateTrackCount = (count: number) => setTrackCount(count);
  const updateArtistTime = (time: string) => setArtistTime(time);
  const updateTrackTime = (time: string) => setTrackTime(time);

  // ---------------- ROUTING ----------------
  const isLoggedIn = !!token;

  const page = isLoggedIn ? (
    <Routes>
      <Route
        path="/Stats"
        element={
          <Stats
            user={userInfo}
            artists={artists}
            tracks={tracks}
            artistCount={artistCount}
            trackCount={trackCount}
            updateArtistCount={updateArtistCount}
            updateTrackCount={updateTrackCount}
            updateArtistTime={updateArtistTime}
            updateTrackTime={updateTrackTime}
            artistTime={artistTime}
            trackTime={trackTime}
          />
        }
      />
      <Route path="/MusicMap" element={<MusicMap genres={genres} />} />
      <Route path="/About" element={<About />} />
      <Route path="/Privacy" element={<Privacy />} />
      <Route path="/" element={<About />} />
    </Routes>
  ) : (
    <Routes>
      <Route
        path="/Stats"
        element={<PromptPage login={handleLogin} logout={handleLogout} />}
      />
      <Route
        path="/MusicMap"
        element={<PromptPage login={handleLogin} logout={handleLogout} />}
      />
      <Route path="/About" element={<About />} />
      <Route path="/Privacy" element={<Privacy />} />
      <Route path="/" element={<About />} />
    </Routes>
  );

  return (
    <Router basename="/Sync">
      <Navbar login={handleLogin} logout={handleLogout} />
      {page}
    </Router>
  );
}

export default App;
