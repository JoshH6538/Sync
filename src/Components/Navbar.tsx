import { Navbar as BootstrapNavbar, NavDropdown, Container, 
    Nav, Image, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Styles/Navbar.css'

interface Props {
    login: ()=>void
    logout: ()=>void
}

export default function Navbar({ login, logout}: Props) {

    const token = sessionStorage.getItem("token");

    const displayButton = () => {
        if(!token)
            return(
                <>
                    <button id="lgin-btn" type="button" className="btn btn-danger nav-btn d-flex ms-auto" onClick={login}>Login</button>
                </>
            );
        else
        return(
            <>
                <button id="lgin-btn" type="button" className="btn btn-danger nav-btn  d-flex ms-auto" onClick={logout}>Logout</button>
            </>
           
            
        );
    }

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

    return(<>

    <BootstrapNavbar expand="lg" className="bg-body-tertiary">
      <Container>
        <BootstrapNavbar.Brand href="/Sync/">
            <Image
              src="Images/TabIcon.png"
              width="30"
              height="30"
              className="d-inline-block align-top mr-2"
              alt="Logo"
            />
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto gap-4" id="nav-links">
            <Nav.Link href="Stats">Stats</Nav.Link>
            <Nav.Link href="MusicMap">Music Map</Nav.Link>
            <Nav.Link href="About">About</Nav.Link>
            
            {/* <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown> */}

            
          </Nav>
          {displayButton()}
        </BootstrapNavbar.Collapse>
        </Container>
    </BootstrapNavbar>

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
    </>);
}