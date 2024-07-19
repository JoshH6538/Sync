import Alert from "./Components/LocationPrompt";
import Button from "./Components/Button";
import ListGroup from "./Components/ListGroup";
import './App.css'
import Map from "./Components/Map";
import React from 'react'
import Navbar from "./Components/Navbar";
import Home from "./Pages/Home"
import GasMap from "./Pages/GasMap";
import About from "./Pages/About";

function App() {

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
    <Navbar></Navbar>
    {page}
  </div>);
}

export default App;