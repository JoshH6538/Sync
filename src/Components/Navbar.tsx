import { Link } from "react-router-dom";
import "../styles/Navbar.css";

interface Props {
  login: () => void;
  logout: () => void;
}

export default function Navbar({ login, logout }: Props) {
  const token = sessionStorage.getItem("token");
  const logoSrc = `${import.meta.env.BASE_URL}sync_icon.svg`;

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
          <Link to="/Stats" className="nav-item">
            Stats
          </Link>
          <Link to="/MusicMap" className="nav-item">
            Music Map
          </Link>
          <Link to="/About" className="nav-item">
            About
          </Link>
        </div>

        {!token ? (
          <button className="nav-button" onClick={login}>
            Login
          </button>
        ) : (
          <button className="nav-button" onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
