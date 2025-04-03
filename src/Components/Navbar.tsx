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

  // if(false)
  // return(<>
  //     <nav className="nav">
  //         <div id='NameLogo'>
  //             <a href="/" className="site-title">Sync</a>
  //             <img src="src\Images\TabIcon.png" alt='icon1'></img>
  //         </div>
  //         <ul>
  //             <li><a href="/">Stats</a></li>
  //             <li><a href="/MusicMap">Music Map</a></li>
  //             <li><a href="/About">About</a></li>

  //         </ul>
  //     </nav>
  // </>);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark" id="navbar">
        <div className="container">
          {/* <!-- Brand Logo (Centered) --> */}
          <a className="navbar-brand mx-auto" href="/Sync/">
            <img
              src="Images/TabIcon.png"
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt="Logo"
              id="logo"
            />
          </a>

          {/* <!-- Navbar Toggler for Collapsing --> */}
          <button
            className="navbar-toggler"
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
            <a className="nav-link border-bottom border-dark-subtle border-top mt-3" href="Stats">Stats</a>
          </li>
          <li className="nav-item">
            <a className="nav-link border-bottom border-dark-subtle" href="MusicMap">Music Map</a>
          </li>
          <li className="nav-item">
            <a className="nav-link border-bottom border-dark-subtle" href="About">About</a>
          </li>
        </ul>
        
        {/* <!-- Links (Left-aligned when expanded) --> */}
        <ul className="navbar-nav me-auto d-none d-lg-flex ms-5 gap-4" id="navlinksExpanded" >
          <li className="nav-item">
            <a className="nav-link" href="Stats">Stats</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="MusicMap">Music Map</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="About">About</a>
          </li>
        </ul>

            {/* <!-- Login Button (Right aligned when expanded, with the links when collapsed) --> */}
            <div className="d-none d-lg-block ms-auto">{displayButton()}</div>

            {/* <!-- Login Button (Visible when collapsed) --> */}
            <div className="d-lg-none d-flex w-100 justify-content-center mt-2 mb-2">{displayButton()}</div>
          </div>
        </div>
      </nav>

      {/* <BootstrapNavbar expand="lg" className="bg-body-tertiary" data-bs-theme="dark">
  <Container>
    <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" className="order-1" />

    <BootstrapNavbar.Brand href="/Sync/" className="mx-auto order-0">
      <Image
        src="Images/TabIcon.png"
        width="30"
        height="30"
        className="d-inline-block align-top"
        alt="Logo"
      />
    </BootstrapNavbar.Brand>


    <BootstrapNavbar.Collapse id="basic-navbar-nav" className="order-2">
      <Nav className="me-auto gap-3" id="nav-links">
        <Nav.Link href="Stats">Stats</Nav.Link>
        <Nav.Link href="MusicMap">Music Map</Nav.Link>
        <Nav.Link href="About">About</Nav.Link>
      </Nav>
      <div className="ms-auto d-none d-lg-block mt-3 mb-2">
        {displayButton()}
      </div>
      <div className="d-lg-none mt-3 mb-2">
        {displayButton()}
      </div>
    </BootstrapNavbar.Collapse>
  </Container>
</BootstrapNavbar> */}

      {/* <nav>
        <a href="/Sync"><img src='Images/TabIcon.png' className="Logo" alt="Tab Icon" /></a>
            <ul id ="top-menu">
                <li><a href="Stats">Stats</a></li>
                <li><a href="MusicMap">Music Map</a></li>
                <li><a href="About">About</a></li>
                {displayButton()}
                <i className="fa-solid fa-x "></i>
            </ul>
            <i className="fa-solid fa-bars" id="bars"></i>
        </nav> */}
    </>
  );
}
