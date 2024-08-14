import Map from "../Components/Map";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../Constants";
import Genres from "../Genres";
import Geohash from "latlon-geohash";

interface Props {
    genres: Set<any>
}





export default function MusicMap({genres}: Props) {

    // if(genres.values.length<1) return (<h1>No genres</h1>);

    // Asks for User Location
    const[latitude, setlatitude] = useState(0);
    const[longitude, setLongitude] = useState(0);
    const[precision, setPrecision] = useState(0);
    const[fetched, setFetched] = useState(false);
    const[fetched1, setFetched1] = useState(false);
    const[genreIds, setGenreIds] = useState<string[]>([])
    let getGenreIds = () => {
        // console.log(genres)
        let ids:string[] = [];
        genres.forEach((genre) => {
            // console.log("Genre:",genre)
            if(genre in Genres)
            {   
                ids.push(Genres[genre]);
            }
        })
        setGenreIds(ids)
        // console.log(genres)
        // console.log(ids)
        return ids;
    }
    

    // const [events,setEvents] = useState([]);
    let localEvents = async () => {
        if((latitude === 0 && longitude === 0) || genreIds.length<1) return;
        if(fetched) return;
        // console.log(latitude,longitude,precision)
        // let ghash = Geohash.encode(latitude,longitude,precision);
        // console.log(ghash)
        let URL = `${Constants.EVENTS_BASE_URL}&latlong=${latitude},${longitude}&radius=50&unit=miles&locale=*&sort=distance,asc`;
        if(genreIds.length>0)
        {
            console.log("specific")
            URL+="&genreId="+genreIds.join(',');
            console.log(URL)
        }
        const {data} = await axios.get(URL,{
        //this is how you set the header, we set it by default upon authentication
        });
        console.log(data);
        //add genres to set
        setFetched(true);
        return data;
    }


    React.useEffect(() =>{
    navigator.geolocation.getCurrentPosition((position) => {
        setlatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setPrecision(position.coords.accuracy);
        // console.log({genres})
    })
    })
    useEffect(() =>{
        getGenreIds();
    },[genres])
    useEffect(() => {
        localEvents();
    },[latitude,longitude,precision,genreIds])

    {if(latitude===0 && longitude ===0)
        return (<>
         <div className="home-container">
            <h1>Please allow location</h1>
            {/* <LocationPrompt></LocationPrompt> */}
        </div>
        </>);}
    return(
    <div className="home-container">
        <h1>Music Map</h1>
        <Map mapLat={latitude} mapLong={longitude}></Map>
        
    </div>);
}