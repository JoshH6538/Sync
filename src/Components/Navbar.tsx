import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AuthMode } from "../providers/AuthProvider";
import "../styles/Navbar.css";

type NavUser = {
  name: string;
  image: string;
  url: string;
};

interface Props {
  authMode: AuthMode;
  user: NavUser;
  onSpotifyLogin: () => void;
  onDemoLogin: () => void;
  logout: () => void;
}

export default function Navbar({
  authMode,
  user,
  onSpotifyLogin,
  onDemoLogin,
  logout,
}: Props) {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const loginRef = useRef<HTMLDivElement | null>(null);
  const logoSrc = `${import.meta.env.BASE_URL}sync_icon.svg`;
  const isAuthed = authMode !== "logged-out";
  const isDemo = authMode === "demo";
  const displayName = isDemo ? "Guest Listener" : user.name || "Sync listener";
  const avatarSrc = user.image || logoSrc;

  useEffect(() => {
    const closeMenus = () => {
      setIsAccountMenuOpen(false);
      setIsLoginMenuOpen(false);
    };
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        accountRef.current?.contains(target) ||
        loginRef.current?.contains(target)
      ) {
        return;
      }

      closeMenus();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSpotifyLogin = () => {
    setIsLoginMenuOpen(false);
    onSpotifyLogin();
  };

  const handleDemoLogin = () => {
    setIsLoginMenuOpen(false);
    onDemoLogin();
  };

  return (
    <nav className="nav-container">
      {/* LEFT */}
      <div className="nav-left">
        <Link to="/" className="nav-logo">
          <img src={logoSrc} width="40" height="40" alt="Sync logo" />
          <span className="nav-brand-text">Sync</span>
        </Link>
      </div>

      {/* RIGHT */}
      <div className="nav-actions">
        <div className="nav-links">
          <Link to="/" className="nav-item">
            Home
          </Link>
          <Link to="/Stats" className="nav-item">
            Stats
          </Link>
          <Link to="/MusicMap" className="nav-item">
            Music Map
          </Link>
        </div>

        {!isAuthed ? (
          <div className="nav-login" ref={loginRef}>
            <button
              type="button"
              className="nav-button"
              aria-expanded={isLoginMenuOpen}
              onClick={() => setIsLoginMenuOpen((open) => !open)}
            >
              Login
            </button>

            {isLoginMenuOpen ? (
              <section className="nav-login-menu" aria-label="Login options">
                <button type="button" onClick={handleSpotifyLogin}>
                  <i className="bi bi-spotify" aria-hidden="true"></i>
                  <span>Login with Spotify</span>
                </button>
                <button type="button" onClick={handleDemoLogin}>
                  <i className="bi bi-person-circle" aria-hidden="true"></i>
                  <span>Continue as guest</span>
                </button>
                <p>
                  Spotify login may require approved access during development.
                </p>
              </section>
            ) : null}
          </div>
        ) : (
          <div className="nav-account" ref={accountRef}>
            <button
              type="button"
              className="nav-avatar-button"
              aria-label="Open account menu"
              aria-expanded={isAccountMenuOpen}
              onClick={() => setIsAccountMenuOpen((open) => !open)}
            >
              <img src={avatarSrc} alt="" />
            </button>

            {isAccountMenuOpen ? (
              <section className="nav-account-menu" aria-label="Account menu">
                <div className="nav-account-user">
                    <img src={avatarSrc} alt="" />
                  <div>
                    <p>{isDemo ? "Demo Account" : "Spotify Account"}</p>
                    <h2>{displayName}</h2>
                  </div>
                </div>

                {!isDemo && user.url ? (
                  <a
                    href={user.url}
                    target="_blank"
                    rel="noreferrer"
                    className="nav-account-link"
                  >
                    <i className="bi bi-spotify" aria-hidden="true"></i>
                    Spotify profile
                  </a>
                ) : null}

                <button type="button" className="nav-account-logout" onClick={logout}>
                  {isDemo ? "Exit demo" : "Logout"}
                </button>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </nav>
  );
}
