import React, {useEffect, useState} from 'react';

export default function LoginStatus () {
    let [loggedIn, setLoggedIn] = useState(false);
    if(window.location.href.includes('access_token'))
    {
        useEffect(() => setLoggedIn(true));
    }
    else if(window.location.href.includes('access_denied'))
    {
        useEffect(() => setLoggedIn(false));
    }  
    return loggedIn;
}
