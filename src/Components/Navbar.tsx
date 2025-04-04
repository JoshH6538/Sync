// import {
//   Navbar as BootstrapNavbar,
//   NavDropdown,
//   Container,
//   Nav,
//   Image,
//   Row,
// } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/Navbar.css";

interface Props {
  login: () => void;
  logout: () => void;
}

export default function Navbar({ login, logout }: Props) {
  const token = sessionStorage.getItem("token");

  const displayButton = () => {
    if (!token)
      return (
        <>
          <button
            id="lgin-btn"
            type="button"
            className="btn btn-danger nav-btn d-flex"
            onClick={login}
          >
            Login
          </button>
        </>
      );
    else
      return (
        <>
          <button
            id="lgin-btn"
            type="button"
            className="btn btn-danger nav-btn  d-flex"
            onClick={logout}
          >
            Logout
          </button>
        </>
      );
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark" id="navbar">
      <div className="container">
        {/* <!-- Brand Logo (Centered) --> */}
        <a className="navbar-brand mx-auto" href="/Sync/">
          <img
            src="Images/TabIcon.png"
            width="35"
            height="35"
            className="d-inline-block align-top"
            alt="Logo"
            id="logo"
          />
        </a>

        {/* <!-- Navbar Toggler for Collapsing --> */}
        <button
          className="navbar-toggler mb-2"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* <!-- Navbar Links and Login Button --> */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* <!-- Links only centered when collapsed --> */}
          <ul className="navbar-nav w-100 text-center d-flex justify-content-center d-lg-none bg-gray-dark">
            <li className="nav-item">
              <a
                className="nav-link border-bottom border-dark-subtle border-top mt-3"
                href="Stats"
              >
                Stats
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link border-bottom border-dark-subtle"
                href="MusicMap"
              >
                Music Map
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link border-bottom border-dark-subtle"
                href="About"
              >
                About
              </a>
            </li>
          </ul>

          {/* <!-- Links (Left-aligned when expanded) --> */}
          <ul
            className="navbar-nav me-auto d-none d-lg-flex ms-5 gap-4"
            id="navlinksExpanded"
          >
            <li className="nav-item">
              <a className="nav-link" href="Stats">
                Stats
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="MusicMap">
                Music Map
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="About">
                About
              </a>
            </li>
          </ul>

          {/* <!-- Login Button (Right aligned when expanded, with the links when collapsed) --> */}
          <div className="d-none d-lg-block ms-auto">{displayButton()}</div>

          {/* <!-- Login Button (Visible when collapsed) --> */}
          <div className="d-lg-none d-flex w-100 justify-content-center mt-2 mb-2">
            {displayButton()}
          </div>
        </div>
      </div>
    </nav>
  );
}
