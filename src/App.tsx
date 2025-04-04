// Style Imports
import './Styles/App.css'

import { useEffect, useState } from 'react';
import Navbar from "./Components/Navbar";
import About from "./Pages/About";
import Stats from "./Pages/Stats"
import MusicMap from "./Pages/MusicMap";
import PromptPage from './Pages/PromptPage';
import Constants from "./Information/Constants";
import SpotifyCredentials from './Information/Credentials/SpotifyCredentials';
import axios from 'axios';


import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  // let debug = true;
  // --------------------- STATES & VARIABLES -------------------

  // Used from url in get request to Spotify
  const SCOPES_URL_PARAM = Constants.SCOPES.join(Constants.SPACE_DELIM);
  //states for setting information from Spotify API
  const [token,setToken] = useState("");
  
  const [artists, setArtists] = useState([]);
  const [artistCount, setArtistCount] = useState(0);
  const [artistTime, setArtistTime] = useState("NONE");
  const [prevACount, setPrevACount] = useState(0);
  const [prevATime, setPrevATime] = useState("NONE");

  const [genres, setGenres] = useState<string[]>([]);

  const [tracks, setTracks] = useState([]);
  const [trackCount, setTrackCount] = useState(0);
  const [trackTime, setTrackTime] = useState("NONE");
  const [prevTCount, setPrevTCount] = useState(0);
  const [prevTTime, setPrevTTime] = useState("NONE");

  const [displayName,setDisplayName] = useState("");
  const [ID,setID] = useState("");
  const [displayPicture, setDisplayPicture] = useState("");
  
  let userInfo = {
    name: displayName,
    id: ID,
    image: displayPicture
  }
  
  // console.log(typeof(userInfo))
  // -------------------- LOGIN / LOGOUT --------------------------

  //pass into nav bar to call onclick for login/logout button
  const handleLogin = () => {
    // Removes trailing slash from url
    let pathname = window.location.pathname.replace(/\/$/, '');
    let redirect = Constants.REDIRECT_URL_AFTER_LOGIN;
    // if(debug) {redirect = "http://localhost:5173";}
    

    const location:string = Constants.SPOTIFY_AUTHORIZE_ENDPOINT + '?client_id=' + SpotifyCredentials.CLIENT_ID + '&redirect_uri=' + redirect+pathname+ '&scope=' + SCOPES_URL_PARAM + '&response_type=token&show_dialog=true';
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
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("expireTime");
  }

  // checks if user is active
  const checkActivity = () => {
    //checks if user logged in
    if(sessionStorage.getItem("token"))
    {
      //then pulls expire time from local storage
      //to see if current time is past expiration
      const expireTime = sessionStorage.getItem("expireTime");
      if(expireTime && expireTime<String(Date.now())) {
        // if so logs out
        console.log("Logging out")
        handleLogout();
      }
    }
  }

  // will replace expireTime with the current time plus 1 hour
  const updateExpire = () => {
    if(sessionStorage.getItem("token"))
    {
      const newTime = Date.now()+600000;
      sessionStorage.setItem("expireTime",String(newTime));
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
    if(!token || token==="" || (artists.length>0 && artistCount===prevACount && artistTime===prevATime)) return;
    let url="https://api.spotify.com/v1/me/top/artists";
    if((artistCount>0 || artistTime!="NONE") && url.length>0 && url[url.length - 1]!='?')url+='?';
    if(artistCount>0)url+=`&limit=${artistCount}`;
    if(artistTime!="NONE")url+=`&time_range=${artistTime}`
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

  let topTracks = async () => {
    // console.log("TRACK:",trackCount,'= ',prevTCount,'?')
    if(!token || token==="" || (tracks.length>0 && trackCount===prevTCount && trackTime===prevTTime)) return;
    // console.log('Filled track?:',tracks[0])
    let url = "https://api.spotify.com/v1/me/top/tracks";
    if((trackCount>0 || trackTime!="NONE") && url.length>0 && url[url.length - 1]!='?')url+='?';
    if(trackCount>0)url+=`&limit=${trackCount}`;
    if(trackTime!="NONE")url+=`&time_range=${trackTime}`
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
    let token = sessionStorage.getItem("token");

    if(!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token"))?.split("=")[1]!;
      
      sessionStorage.setItem("token",token);
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
  },[token, artistCount, trackCount, artistTime, trackTime]);



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

  const setStatTime = (time:string, setter:React.Dispatch<React.SetStateAction<string>>) => {
    if(time === 'short_term' || time === 'medium_term' || time === 'long_term') {
      if(setter === setArtistTime) {
        setPrevATime(artistTime);
      }
      else if (setter === setTrackTime) {
        setPrevTTime(trackTime);
      }
      setter(time);
    }
  }

  // --------------------- PAGE RENDERING ---------------------
  // // Defines different pages of the site
  // // let page = <Stats user={userInfo} artists={artists} tracks={tracks}/>
  // let page = <Stats user={userInfo} artists={artists} tracks={tracks} 
  // artistCount={artistCount} trackCount={trackCount} updateStatCounts={setStatCount} 
  // updateStatTimes={setStatTime} artistTime={setArtistTime} trackTime={setTrackTime}/>
  // const rawPath = window.location.pathname;
  // const path = rawPath.endsWith('/') && rawPath.length > 1
  //     ? rawPath.slice(0, -1)
  //     : rawPath;

  // console.log("PATH:", rawPath);
  // console.log("Normalized PATH:", path);
  // switch(path) {
  //   case "/Sync/Stats":
  //     page = <Stats user={userInfo} artists={artists} tracks={tracks} 
  //     artistCount={setArtistCount} trackCount={setTrackCount} updateStatCounts={setStatCount} 
  //     updateStatTimes={setStatTime} artistTime={setArtistTime} trackTime={setTrackTime}/>
  //     break
  //   case "/Sync/MusicMap":
  //     // if(genres.values.length>0)
  //     page = <MusicMap genres={genres}/>
  //     break
  //   case "/Sync/About":
  //     page = <About/>
  //     break
  //   default:
  //     page = <About/>
  //     break
  // }
  // if(path === '/Sync' || path === '/Sync/About') {
  //   console.log("NO PROMPT")
  // }
  // else if(!sessionStorage.getItem("token")) page = <PromptPage login={handleLogin} logout={handleLogout}></PromptPage>
  // return(
  // <div>
  //   <Navbar login={handleLogin} logout={handleLogout}></Navbar>
  //   {/*token ? <button className="btn btn-danger see" onClick={topArtists}>User</button> : <h3>login first</h3>*/}
  //   {page}
  // </div>);
  
  // -------------------------------------------------------------------------------
  // Check if the token exists in session storage
  const isLoggedIn = sessionStorage.getItem("token");
  const page = isLoggedIn ? (
    <Routes>
      <Route 
        path="/Stats" 
        element={<Stats 
                   user={userInfo} 
                   artists={artists} 
                   tracks={tracks} 
                   artistCount={setArtistCount} 
                   trackCount={setTrackCount} 
                   updateStatCounts={setStatCount} 
                   updateStatTimes={setStatTime} 
                   artistTime={setArtistTime} 
                   trackTime={setTrackTime} 
                 />} 
      />
      <Route 
        path="/MusicMap" 
        element={<MusicMap genres={genres} />} 
      />
      <Route 
        path="/About" 
        element={<About />} 
      />
      <Route 
        path="/" 
        element={<About />} 
      /> {/* Default route */}
    </Routes>
  ) : (
    <PromptPage login={handleLogin} logout={handleLogout} />
  );

  return (
    <Router basename="/Sync">
      <div>
        <Navbar login={handleLogin} logout={handleLogout} />
        {page} {/* Render the appropriate page */}
      </div>
    </Router>
  );
}

export default App;