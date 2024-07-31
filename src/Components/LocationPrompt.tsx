import { ReactNode } from "react";
import React from 'react'

interface Props {
  lat: number;
  long: number;
}


function AskLocation({lat, long}: Props) {
  console.log("CLick");
  // Asks for User Location
  const[latitude, setLatitude] = React.useState(0);
  const[longitude, setLongitude] = React.useState(0);
  React.useEffect(() =>{
  navigator.geolocation.getCurrentPosition((position) => {
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
      lat = latitude;
      long = longitude;
  })
  }, [])
}
function onClick() {AskLocation}
const LocationPrompt = () => {
  return (
    <button type="button" className="btn btn-outline-primary" onClick={onClick}>Allow Location</button>
  )
}

export default AskLocation;