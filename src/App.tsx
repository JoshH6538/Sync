// Style Imports
import './Styles/App.css'

import { useEffect, useState } from 'react'
import Navbar from "./Components/Navbar";
import Home from "./Pages/Home"
import MusicMap from "./Pages/MusicMap";
import About from "./Pages/About";
import Constants from "./Information/Constants";
import SpotifyCredentials from './Information/Credentials/SpotifyCredentials';
import axios from 'axios';

function App() {
  // --------------------- STATES & VARIABLES -------------------

  // Used from url in get request to Spotify
  const SCOPES_URL_PARAM = Constants.SCOPES.join(Constants.SPACE_DELIM);
  //states for setting information from Spotify API
  const [token,setToken] = useState("");
  const [artists, setArtists] = useState([]);
  const [artistCount, setArtistCount] = useState(0);
  const [prevACount, setPrevACount] = useState(0);
  const [genres, setGenres] = useState<string[]>([]);

  const [trackCount, setTrackCount] = useState(0);
  const [prevTCount, setPrevTCount] = useState(0);

  const [displayName,setDisplayName] = useState("");
  const [ID,setID] = useState("");
  const [displayPicture, setDisplayPicture] = useState("");

  let userInfo = {
    name: displayName,
    id: ID,
    image: displayPicture
  }

  // -------------------- LOGIN / LOGOUT --------------------------

  //pass into nav bar to call onclick for login/logout button
  const handleLogin = () => {
    const location:string = Constants.SPOTIFY_AUTHORIZE_ENDPOINT + '?client_id=' + SpotifyCredentials.CLIENT_ID + '&redirect_uri=' + Constants.REDIRECT_URL_AFTER_LOGIN+window.location.pathname+ '&scope=' + SCOPES_URL_PARAM + '&response_type=token&show_dialog=true';
    window.location.href = location;
  }
  //Remove information upon logout
  const handleLogout = () => {
    setToken("");
    setArtists([]);
    setID("");
    setDisplayName("");
    setTracks([]);
    //removes from local storage on logout
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("expireTime");
  }

  // checks if user is active
  const checkActivity = () => {
    //checks if user logged in
    if(localStorage.getItem("token"))
    {
      //then pulls expire time from local storage
      //to see if current time is past expiration
      const expireTime = localStorage.getItem("expireTime");
      if(expireTime && expireTime<String(Date.now())) {
        // if so logs out
        console.log("Logging out")
        handleLogout();
      }
    }
  }

  // will replace expireTime with the current time plus 1 hour
  const updateExpire = () => {
    if(localStorage.getItem("token"))
    {
      const newTime = Date.now()+600000;
      window.localStorage.setItem("expireTime",String(newTime));
    }
  }

  //set interval for how often to check is user is active
  useEffect(()=> {
    const interval = setInterval( () => {
      checkActivity();
    },10000);
    return () => clearInterval(interval);
  },[]);

  //update expire on user active
  useEffect(() => {
    updateExpire();
    //set event listers
    window.addEventListener('click',updateExpire);
    window.addEventListener('keypress',updateExpire);
    window.addEventListener('scroll',updateExpire);
    window.addEventListener('mousemove',updateExpire);
    //clean up
    return () => {
      window.removeEventListener('click',updateExpire);
      window.removeEventListener('keypress',updateExpire);
      window.removeEventListener('scroll',updateExpire);
      window.removeEventListener('mousemove',updateExpire);
    }
  })

  // --------------------- GETTING INFO FROM SPOTIFY ---------------------
  
  //get user data from api and set variables
  let userProfile = async () => {
    
    if(!token || token==="" || ID.length>0) return;
    // console.log("Filled?:",displayName)
    const {data} = await axios.get("https://api.spotify.com/v1/me",{
      //this is how you set the header, we set it by default upon authentication
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    console.log('get called for user')
    console.log(data)
    setDisplayName(data["display_name"]);
    setID(data["id"]);
    setDisplayPicture(data["images"][1].url);
    // console.log("------------->",data["images"][1]);
    return data;
  }
  
  let topArtists = async () => {
    // console.log("ARTIST:",artistCount,'= ',prevACount,'?')
    if(!token || token==="" || (artists.length>0 && artistCount===prevACount)) return;
    // if(artist)
    // console.log("Filled?:",artists[0])
    let url="https://api.spotify.com/v1/me/top/artists";
    if(artistCount>0)url+=`?&limit=${artistCount}`;
    const {data} = await axios.get(url,{
      //this is how you set the header, we set it by default upon authentication
    headers: {
      Authorization: `Bearer ${token}`
    }
    });
    console.log('get called for artists')
    // console.log(data);
    setArtists(data.items);
    //add genres to set
    let genreInfo:string[] = [];
    // console.log('###########################')
    data.items.map((artist:any) => {
      // console.log('\t artist:',artist.name,'->')
      // console.log(artist)
      artist.genres.map((genre: any) => {
        // console.log(genre)
        genreInfo.push(genre)
      })
    })
    // console.log("Genres:",genreInfo)
    setGenres(genreInfo)
    return data;
  }
  async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

  const [tracks, setTracks] = useState([]);
  let topTracks = async () => {
    // console.log("TRACK:",trackCount,'= ',prevTCount,'?')
    // console.log("sleeping")
    // await sleep(10000);
    if(!token || token==="" || (tracks.length>0 && trackCount===prevTCount)) return;
    // console.log('Filled track?:',tracks[0])
    let url = "https://api.spotify.com/v1/me/top/tracks";
    if(trackCount>0)url+=`?&limit=${trackCount}`;
    const {data} = await axios.get(url,{
      //this is how you set the header, we set it by default upon authentication
    headers: {
      Authorization: `Bearer ${token}`
    }
    });
    console.log('get called for tracks')
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
      updateExpire();
      window.location.hash = "";
    }

    userProfile();
    topArtists();
    topTracks();
    setToken(token!);
    // console.log(location.pathname);
    // axios.defaults.baseURL = 'https://api.spotify.com/v1';
    // axios.defaults.headers['Authorization'] = `Bearer ${token}`;
    // axios.defaults.headers['Content-Type'] = 'application/json';
    console.log("Exiting Use Effect")
  },[token, artistCount, trackCount]);



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
   
  const setStatCount = (count:number, setter:React.Dispatch<React.SetStateAction<number>>) =>{
    // console.log("BUTTON CLICKED")
    // console.log("current count state:",trackCount)
    // console.log("new count:",count)
    // console.log('========================')
    if(count>0 && count <= 50) {
      if(setter === setArtistCount) {
        setPrevACount(artistCount);
      }
      else if (setter === setTrackCount) {
        setPrevTCount(trackCount);
      }
      setter(count);
    }
  }
  // Defines different pages of the site
  // let page = <Home user={userInfo} artists={artists} tracks={tracks}/>
  let page = <Home user={userInfo} artists={artists} tracks={tracks} 
  artistCount={setArtistCount} trackCount={setTrackCount} updateStatCounts={setStatCount}/>
  switch(window.location.pathname) {
    case "/":
      page = <Home user={userInfo} artists={artists} tracks={tracks} 
  artistCount={setArtistCount} trackCount={setTrackCount} updateStatCounts={setStatCount}/>
      break
    case "/MusicMap":
      // if(genres.values.length>0)
      page = <MusicMap genres={genres}/>
      break
    case "/About":
      page = <About/>
      break
    default:
      // 
      page = <Home user={userInfo} artists={artists} tracks={tracks} 
  artistCount={setArtistCount} trackCount={setTrackCount} updateStatCounts={setStatCount}/>
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