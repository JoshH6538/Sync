// Style Imports
import './Styles/App.css'

import React, { useEffect, useState } from 'react'
import Navbar from "./Components/Navbar";
import Home from "./Pages/Home"
import MusicMap from "./Pages/MusicMap";
import About from "./Pages/About";
import Constants from "./Constants";
import axios from 'axios';

function App() {

  const SCOPES_URL_PARAM = Constants.SCOPES.join(Constants.SPACE_DELIM);


  //state for setting token
  const [token,setToken] = useState("");
  
  //pass into nav bar to call onclick for login/logout button
  const handleLogin = () => {
    const location:string = Constants.SPOTIFY_AUTHORIZE_ENDPOINT + '?client_id=' + Constants.CLIENT_ID + '&redirect_uri=' + Constants.REDIRECT_URL_AFTER_LOGIN + '&scope=' + SCOPES_URL_PARAM + '&response_type=token&show_dialog=true';
    // window.location.href = '${SPOTIFY_AUTHORIZE_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL_AFTER_LOGIN}&scope=${SCOPES_URL_PARAM}&response_type=token&show_dialog=true';
    window.location.href = location;
  }

  const handleLogout = () => {
    setToken("");
    setArtists([]);
    setID("");
    setDisplayName("");
    window.localStorage.removeItem("token");
  }

  //use states to set variables
  const [displayName,setDisplayName] = useState("");
  const [ID,setID] = useState("");

  //get data from api and set variables
  let userProfile = async () => {
    if(!token || token==="" || ID.length>0) return;
    const {data} = await axios.get("https://api.spotify.com/v1/me",{
      //this is how you set the header, we set it by default upon authentication
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    // console.log(data)
    setDisplayName(data["display_name"]);
    setID(data["id"]);
    // console.log(ID);
    return data;
  }

  //group variables
  let userInfo = {
    name: displayName,
    id: ID
  }

  

  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState<string[]>([]);
  let topArtists = async () => {
    if(!token || token==="" || artists.length > 0) return;
    const {data} = await axios.get("https://api.spotify.com/v1/me/top/artists",{
      //this is how you set the header, we set it by default upon authentication
    headers: {
      Authorization: `Bearer ${token}`
    }
    });
    // console.log(data);
    setArtists(data.items);
    //add genres to set
    let genreInfo:string[] = [];
    // console.log('###########################')
    data.items.map((artist:any) => {
      // console.log('\t artist:',artist.name,'->')
      artist.genres.map((genre: any) => {
        // console.log(genre)
        genreInfo.push(genre)
      })
    })
    // console.log("Genres:",genreInfo)
    setGenres(genreInfo)
    return data;
  }

  const [tracks, setTracks] = useState([]);
  let topTracks = async () => {
    if(!token || token==="" || tracks.length > 0) return;
    const {data} = await axios.get("https://api.spotify.com/v1/me/top/tracks",{
      //this is how you set the header, we set it by default upon authentication
    headers: {
      Authorization: `Bearer ${token}`
    }
    });
    // console.log(data);
    setTracks(data.items);
    return data;
  }

  

  //if url contains the hash, pull token from hash and set the token in state
  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if(!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token"))?.split("=")[1]!;
      
      window.localStorage.setItem("token",token);
      window.location.hash = "";
    }
    userProfile();
    topArtists();
    topTracks();
    setToken(token!);
    // axios.defaults.baseURL = 'https://api.spotify.com/v1';
    // axios.defaults.headers['Authorization'] = `Bearer ${token}`;
    // axios.defaults.headers['Content-Type'] = 'application/json';
    
  });



   // Asks for User Location
   /*
   const[latitude, setLatitude] = React.useState(0);
   const[longitude, setLongitude] = React.useState(0);
   React.useEffect(() =>{
   navigator.geolocation.getCurrentPosition((position) => {
       setLatitude(position.coords.latitude);
       setLongitude(position.coords.longitude);
   })
   }, [])
    */

  // Defines different pages of the site
  let page = <Home user={userInfo} artists={artists} tracks={tracks}/>
  switch(window.location.pathname) {
    case "/":
      page = <Home user={userInfo} artists={artists} tracks={tracks}/>
      break
    case "/MusicMap":
      // if(genres.values.length>0)
      page = <MusicMap genres={genres}/>
      break
    case "/About":
      page = <About/>
      break
    default:
      page = <Home user={userInfo} artists={artists} tracks={tracks}/>
      break
  }

  return(
  <div>
    <Navbar login={handleLogin} logout={handleLogout}></Navbar>
    {/*token ? <button className="btn btn-danger see" onClick={topArtists}>User</button> : <h3>login first</h3>*/}
    {page}
  </div>);
}

export default App;