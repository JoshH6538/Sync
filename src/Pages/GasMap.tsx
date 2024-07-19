import Map from "../Components/Map";
import LocationPrompt from "../Components/LocationPrompt";

interface Props {
    lat: number;
    long: number;
}


export default function GasMap({lat,long}: Props) {
    {if(lat ===0 && long ===0)
        return (<>
         <div className="home-container">
            <h1>Please allow location</h1>
        </div>
        </>);}
    return(
    <div className="home-container">
        <h1>Gas Map</h1>
        <Map mapLat={lat} mapLong={long}></Map>
        <LocationPrompt lat={lat} long={long}></LocationPrompt>
    </div>);
}