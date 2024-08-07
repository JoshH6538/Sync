import './App.css'
import React, { useEffect, useState } from 'react'
import Navbar from "./Components/Navbar";
import Home from "./Pages/Home"
import GasMap from "./Pages/GasMap";
import About from "./Pages/About";
import Constants from "./Constants";
import axios from 'axios';

function App() {



  const SCOPES_URL_PARAM = Constants.SCOPES.join(Constants.SPACE_DELIM);


  //state for setting token
  const [token,setToken] = useState("");
  //if url contains the hash, pull token from hash and set the token in state
  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if(!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token"))?.split("=")[1]!;
      
      window.localStorage.setItem("token",token);
      window.location.hash = "";
    }
    setToken(token!);

  })
  //pass into nav bar to call onclick for login/logout button
  const handleLogin = () => {
    const location:string = Constants.SPOTIFY_AUTHORIZE_ENDPOINT + '?client_id=' + Constants.CLIENT_ID + '&redirect_uri=' + Constants.REDIRECT_URL_AFTER_LOGIN + '&scope=' + SCOPES_URL_PARAM + '&response_type=token&show_dialog=true';
    // window.location.href = '${SPOTIFY_AUTHORIZE_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL_AFTER_LOGIN}&scope=${SCOPES_URL_PARAM}&response_type=token&show_dialog=true';
    window.location.href = location;
  }

  const handleLogout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  }


  let userProfile = async () => {
    const {data} = await axios.get("https://api.spotify.com/v1/me",{
    headers: {
      Authorization: `Bearer ${token}`
    }})
    console.log(data)
    return data;
  }




   // Asks for User Location
   const[latitude, setLatitude] = React.useState(0);
   const[longitude, setLongitude] = React.useState(0);
   React.useEffect(() =>{
   navigator.geolocation.getCurrentPosition((position) => {
       setLatitude(position.coords.latitude);
       setLongitude(position.coords.longitude);
   })
   }, [])

  // Defines different pages of the site
  let page = <Home/>
  switch(window.location.pathname) {
    case "/":
      page = <Home/>
      break
    case "/GasMap":
      page = <GasMap lat={(latitude)} long={longitude}/>
      break
    case "/About":
      page = <About/>
      break
    default:
      page = <Home/>
      break
  }

  return(
  <div>
    <Navbar login={handleLogin} logout={handleLogout}></Navbar>
    {token ? <button className="btn btn-danger see" onClick={userProfile}>User</button> : <h3>login first</h3>}
    {page}
  </div>);
}

export default App;