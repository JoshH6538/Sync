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
                    <li><button type="button" className="btn btn-danger" onClick={login}>Login</button></li>
                </>
            );
        else
        return(
            <>
                <li><button type="button" className="btn btn-danger" onClick={logout}>Logout</button></li>
            </>
           
            
        );
    }

    return(<>
        <nav className="nav">
            <div id='NameLogo'>
                <a href="/" className="site-title">Sync</a>
                <img src="src\Images\TabIcon.png" alt='icon1'></img>
            </div>
            <ul>
                <li><a href="/">Stats</a></li>
                <li><a href="/MusicMap">Music Map</a></li>
                <li><a href="/About">About</a></li>
                {displayButton()}
            </ul>
        </nav>
    </>);
}