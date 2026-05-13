import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./providers/AuthProvider";
import { useSpotifyData } from "./hooks/useSpotifyData";
import {
  demoSpotifyUser,
  getDemoSpotifyRangeData,
  getDemoTasteProfile,
  getDemoTicketmasterQueryPlan,
  getDemoTopArtists,
  getDemoTopTracks,
} from "./data/demo/demoSpotifyData";
import { SpotifyTimeRange } from "./types/taste";

import Navbar from "./components/Navbar";
import LoginModal from "./components/LoginModal";
import Home from "./pages/Home";
import About from "./pages/About";
import Stats from "./pages/Stats";
import MusicMap from "./pages/MusicMap";
import Privacy from "./pages/Privacy";

import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

const POST_AUTH_REDIRECT_KEY = "sync_post_auth_redirect";

function App() {
  return (
    <Router basename="/Sync">
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const { token, authMode, login, startDemo, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [demoArtistCount, setDemoArtistCount] = useState(20);
  const [demoTrackCount, setDemoTrackCount] = useState(20);
  const [demoRange, setDemoRange] = useState<SpotifyTimeRange>("medium_term");

  const spotifyData = useSpotifyData(token);
  const {
    user,
    artists,
    tracks,
    artistCount,
    trackCount,
    artistTime,
    trackTime,
    tasteProfile,
    ticketmasterQueryPlan,
    setArtistCount,
    setTrackCount,
    setArtistTime,
    setTrackTime,
  } = spotifyData;

  const isDemo = authMode === "demo";
  const canUseApp = authMode !== "logged-out";
  const demoRangeData = useMemo(
    () => getDemoSpotifyRangeData(demoRange),
    [demoRange],
  );
  const activeUser = isDemo ? demoSpotifyUser : user;
  const activeArtists = isDemo
    ? getDemoTopArtists(demoRange, demoArtistCount)
    : artists;
  const activeTracks = isDemo
    ? getDemoTopTracks(demoRange, demoTrackCount)
    : tracks;
  const activeArtistCount = isDemo
    ? Math.min(demoArtistCount, demoRangeData.topArtists.length)
    : artistCount;
  const activeTrackCount = isDemo
    ? Math.min(demoTrackCount, demoRangeData.topTracks.length)
    : trackCount;
  const activeArtistTime = isDemo ? demoRangeData.source.artistTimeRange : artistTime;
  const activeTrackTime = isDemo ? demoRangeData.source.trackTimeRange : trackTime;
  const activeTasteProfile = isDemo ? getDemoTasteProfile(demoRange) : tasteProfile;
  const activeTicketmasterQueryPlan = isDemo
    ? getDemoTicketmasterQueryPlan(demoRange)
    : ticketmasterQueryPlan;

  const openLoginModal = () => {
    sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, "/Stats");
    setIsLoginModalOpen(true);
  };
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const handleSpotifyLogin = () => {
    sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, "/Stats");
    closeLoginModal();
    login();
  };
  const handleDemoLogin = () => {
    startDemo();
    closeLoginModal();
    navigate("/Stats");
  };
  const setDemoTimeRange = (range: string) => {
    setDemoRange(range as SpotifyTimeRange);
  };

  useEffect(() => {
    if (authMode !== "spotify" || !token || !user.id) return;

    const redirectTo = sessionStorage.getItem(POST_AUTH_REDIRECT_KEY);
    if (!redirectTo) return;

    sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);
    navigate(redirectTo, { replace: true });
  }, [authMode, navigate, token, user.id]);

  const page = canUseApp ? (
    <Routes>
      <Route
        path="/Stats"
        element={
          <Stats
            user={activeUser}
            artists={activeArtists as any[]}
            tracks={activeTracks as any[]}
            artistCount={activeArtistCount}
            trackCount={activeTrackCount}
            updateArtistCount={isDemo ? setDemoArtistCount : setArtistCount}
            updateTrackCount={isDemo ? setDemoTrackCount : setTrackCount}
            updateArtistTime={isDemo ? setDemoTimeRange : setArtistTime}
            updateTrackTime={isDemo ? setDemoTimeRange : setTrackTime}
            artistTime={activeArtistTime}
            trackTime={activeTrackTime}
            tasteProfile={activeTasteProfile}
          />
        }
      />
      <Route
        path="/MusicMap"
        element={
          <MusicMap
            tasteProfile={activeTasteProfile}
            ticketmasterQueryPlan={activeTicketmasterQueryPlan}
          />
        }
      />
      <Route path="/About" element={<About />} />
      <Route path="/Privacy" element={<Privacy />} />
      <Route
        path="/"
        element={
          <Home
            isAuthenticated={canUseApp}
            onLoginClick={openLoginModal}
            onViewTaste={() => navigate("/Stats")}
          />
        }
      />
    </Routes>
  ) : (
    <Routes>
      <Route
        path="/Stats"
        element={<Navigate to="/" replace state={{ openAuthModal: true }} />}
      />
      <Route
        path="/MusicMap"
        element={<Navigate to="/" replace state={{ openAuthModal: true }} />}
      />
      <Route path="/About" element={<About />} />
      <Route path="/Privacy" element={<Privacy />} />
      <Route
        path="/"
        element={
          <Home
            isAuthenticated={canUseApp}
            onLoginClick={openLoginModal}
            onViewTaste={() => navigate("/Stats")}
          />
        }
      />
    </Routes>
  );

  return (
    <>
      <Navbar
        authMode={authMode}
        user={activeUser}
        onSpotifyLogin={handleSpotifyLogin}
        onDemoLogin={handleDemoLogin}
        logout={logout}
      />
      {page}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onSpotifyLogin={handleSpotifyLogin}
        onDemoLogin={handleDemoLogin}
      />
    </>
  );
}

export default App;
