import '../Styles/Navbar.css'
// import { Navbar as BootstrapNavbar, NavDropdown, Container, 
//     Nav, Image, Row } from 'react-bootstrap';


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
                    <li><button id="lgin-btn" type="button" className="btn btn-danger nav-btn" onClick={login}>Login</button></li>
                </>
            );
        else
        return(
            <>
                <li><button id="lgin-btn" type="button" className="btn btn-danger nav-btn" onClick={logout}>Logout</button></li>
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

    {/* <BootstrapNavbar expand="lg" className="bg-body-tertiary">
      <Container><Row>
        <BootstrapNavbar.Brand href="/Sync/"><Image src='Images/TabIcon.png' className="Logo" alt="Tab Icon"/></BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#link">Link</Nav.Link>
            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </BootstrapNavbar.Collapse>
        </Row></Container>
    </BootstrapNavbar> */}

        <nav>
        <a href="/Sync"><img src='Images/TabIcon.png' className="Logo" alt="Tab Icon" /></a>
            <ul id ="top-menu">
                <li><a href="Stats">Stats</a></li>
                <li><a href="MusicMap">Music Map</a></li>
                <li><a href="About">About</a></li>
                {displayButton()}
                <i className="fa-solid fa-x "></i>
            </ul>
            <i className="fa-solid fa-bars" id="bars"></i>
        </nav>
    </>);
}