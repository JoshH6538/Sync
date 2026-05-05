import "./Styles/App.css";

import { useEffect, useState } from "react";
import { useAuth } from "./providers/AuthProvider";

import Navbar from "./Components/Navbar";
import About from "./Pages/About";
import Stats from "./Pages/Stats";
import MusicMap from "./Pages/MusicMap";
import PromptPage from "./Pages/PromptPage";
import Privacy from "./Pages/Privacy";
import axios from "axios";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  const { token, login, logout } = useAuth();

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

  const userInfo = {
    name: displayName,
    id: ID,
    image: displayPicture,
    url: userUrl,
  };

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
        element={<PromptPage login={login} logout={logout} />}
      />
      <Route
        path="/MusicMap"
        element={<PromptPage login={login} logout={logout} />}
      />
      <Route path="/About" element={<About />} />
      <Route path="/Privacy" element={<Privacy />} />
      <Route path="/" element={<About />} />
    </Routes>
  );

  return (
    <Router basename="/Sync">
      <Navbar login={login} logout={logout} />
      {page}
    </Router>
  );
}

export default App;
