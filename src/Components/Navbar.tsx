import Constants from '../ConstantsFile';
const SCOPES_URL_PARAM = Constants.SCOPES.join(Constants.SPACE_DELIM);
import LoginStatus from '../LoginStatus';


interface Props {
    logIn: boolean
}

export default function Navbar({logIn}: Props) {
    // let [loggedIn, setLoggedIn] = useState(false);

    const handleLogin = () => {
        const location:string = Constants.SPOTIFY_AUTHORIZE_ENDPOINT + '?client_id=' + Constants.CLIENT_ID + '&redirect_uri=' + Constants.REDIRECT_URL_AFTER_LOGIN + '&scope=' + SCOPES_URL_PARAM + '&response_type=token&show_dialog=true';
        // window.location.href = '${SPOTIFY_AUTHORIZE_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL_AFTER_LOGIN}&scope=${SCOPES_URL_PARAM}&response_type=token&show_dialog=true';
        window.location.href = location;
        // console.log(location);
    }

    const displayButton = () => {
        if(logIn)
            return(
                <>
                    <li><button type="button" className="btn btn-danger" onClick={handleLogin}>Sign Out</button></li>
                </>
            );
        else
        return(
            <>
                <li><button type="button" className="btn btn-danger" onClick={handleLogin}>Login</button></li>
            </>
            
        );
    }

    return(<>
        <nav className="nav">
            <a href="/" className="site-title">Sync</a>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/GasMap">Music Map</a></li>
                <li><a href="/About">About</a></li>
                {displayButton()}
            </ul>
        </nav>
    </>);
}