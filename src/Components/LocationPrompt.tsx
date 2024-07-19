import { ReactNode } from "react";
import React from 'react'

interface Props {
  lat: number;
  long: number;
}


const LocationPrompt = ({lat, long}: Props) => {

    console.log(lat," ",long);
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
  return (
    <button type="button" className="btn btn-outline-primary" >Allow Location</button>
  )
}

export default LocationPrompt;