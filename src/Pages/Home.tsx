// import LocationPrompt from "../Components/LocationPrompt";
import React from 'react'


interface Props {
    lat: number;
    long: number;
}

export default function Home({lat, long}: Props) {
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
    return(
    <div className="home-container">
        <h1>HELLO</h1>
    </div>);
}