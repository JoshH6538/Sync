import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/Navbar.css";

interface Props {
  login: () => void;
  logout: () => void;
}

export default function Navbar({ login, logout }: Props) {
  const token = sessionStorage.getItem("token");

  return (
    <nav className="nav-container d-flex align-items-center justify-content-between px-4 py-2">
      {/* LEFT */}
      <div className="d-flex align-items-center">
        <Link to="//" className="nav-logo">
          <img src="Images/TabIcon.png" width="35" height="35" alt="Logo" />
        </Link>
      </div>

      {/* CENTER */}
      <div className="nav-center d-flex justify-content-center gap-5">
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

      {/* RIGHT */}
      <div className="d-flex align-items-center">
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
