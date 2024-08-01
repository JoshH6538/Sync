
import React, {useEffect, useState} from 'react';

// DEV ID
const CLIENT_ID = "61b76b12c48648a8aaf3b1a270b8c7f5";
// Authorize page
const SPOTIFY_AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize";
//redirect back to site
const REDIRECT_URL_AFTER_LOGIN = "http://localhost:5173/";
//permissions from api at https://developer.spotify.com/documentation/web-api/concepts/scopes
const SCOPES = ["user-top-read"];
const SPACE_DELIM = "%20";
const SCOPES_URL_PARAM = SCOPES.join(SPACE_DELIM);

export default function Navbar() {
    let [loggedIn, setLoggedIn] = useState(false);

    const handleLogin = () => {
        const location:string = SPOTIFY_AUTHORIZE_ENDPOINT + '?client_id=' + CLIENT_ID + '&redirect_uri=' + REDIRECT_URL_AFTER_LOGIN + '&scope=' + SCOPES_URL_PARAM + '&response_type=token&show_dialog=true';
        // window.location.href = '${SPOTIFY_AUTHORIZE_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL_AFTER_LOGIN}&scope=${SCOPES_URL_PARAM}&response_type=token&show_dialog=true';
        window.location.href = location;
        // console.log(location);
    }
    const checkLogin = () => {
        if(window.location.href.includes('access_token'))
        {
            useEffect(() => setLoggedIn(true));
            return;
        }
        else if(window.location.href.includes('access_denied'))
        {
            useEffect(() => setLoggedIn(false));
            return;
        }
        return;
    }

    const displayButton = () => {
        checkLogin();
        if(loggedIn)
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
            <a href="/" className="site-title bg-danger">Sync</a>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/GasMap">Gas Map</a></li>
                <li><a href="/About">About</a></li>
                {displayButton()}
            </ul>
        </nav>
    </>);
}