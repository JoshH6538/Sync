import "./Styles/App.css";

import { useEffect, useState } from "react";

import { useAuth } from "./providers/AuthProvider";
import { useSpotifyData } from "./hooks/useSpotifyData";

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

  const {
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
  } = useSpotifyData(token);

  const isLoggedIn = !!token;

  const page = isLoggedIn ? (
    <Routes>
      <Route
        path="/Stats"
        element={
          <Stats
            user={user}
            artists={artists}
            tracks={tracks}
            artistCount={artistCount}
            trackCount={trackCount}
            updateArtistCount={setArtistCount}
            updateTrackCount={setTrackCount}
            updateArtistTime={setArtistTime}
            updateTrackTime={setTrackTime}
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
