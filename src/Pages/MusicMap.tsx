import MapWindow from "../Components/MapWindow";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../Information/Constants";
import TicketmasterCredentials from "../Information/Credentials/TicketmasterCredentials";
import Genres from "../Genres";
import Subgenres from "../Subgenres";
import LocalEvent from "../LocalEventClass";
import LocalVenue from "../LocalVenueClass";
import '../Styles/MusicMap.css'
import EventList from "../Components/EventList";

interface Props {
    genres: string[],
}

export default function MusicMap({genres}: Props) {
    // Asks for User Location
    const[latitude, setlatitude] = useState(0);
    const[longitude, setLongitude] = useState(0);
    const[precision, setPrecision] = useState(0);
    //to stop constant get requests
    const[fetched, setFetched] = useState(false);
    //genre ids from hashmap
    const[genreIds, setGenreIds] = useState<string[]>([])
    //list of event objects
    const[events, setEvents] = useState<LocalEvent[]>([])

    let getGenreIds = () => {
        // console.log(genres)
        let leftovers:string[] = [];
        let ids:string[] = [];
        genres.forEach((genre) => {
            // console.log("Genre:",genre)
            if(genre in Subgenres)
            {
                // console.log(genre)
                ids.push(Subgenres[genre]);
            }
            else
            {
                leftovers.push(genre);
            }
        })
        leftovers.forEach((genre) => {
            // console.log("Genre:",genre)
            if(genre in Genres)
            {
                // console.log(genre)
                ids.push(Genres[genre]);
            }
        })
        setGenreIds(ids)
        return ids;
    }
    let localEvents = async () => {
        if((latitude === 0 && longitude === 0) || genreIds.length<1) return;
        if(fetched) return;
        // console.log(latitude,longitude,precision)
        // let ghash = Geohash.encode(latitude,longitude,precision);
        // console.log(ghash)
        let URL = `${Constants.EVENTS_BASE_URL}${TicketmasterCredentials.TICKET_KEY}&latlong=${latitude},${longitude}&radius=100&unit=miles&locale=*&sort=distance,asc`;
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
        let eventList:LocalEvent[] = [];
        data._embedded.events.map((event:any) => {
            // console.log(event.name,event.images[0],event._embedded.venues[0])
            let currentVenue = new LocalVenue(event._embedded.venues[0].name, event._embedded.venues[0].location.latitude,event._embedded.venues[0].location.longitude);
            let currentEvent = new LocalEvent(event.name,event.id,event.images[0].url, currentVenue,event.distance);
            eventList.push(currentEvent);
        })
        setEvents(eventList);
        // console.log("EVENT LIST: ",eventList);
        // console.log(events)
        //add genres to set
        setFetched(true);
        return events;
    }

    let eventMap = (events:any) => {

        return(
            <>
                <MapWindow mapLat={latitude} mapLong={longitude} events={events}></MapWindow>
            </>
        );
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
        console.log("EvEnTs:",events)
    },[latitude,longitude,precision,genreIds,events])


    

    if(window.localStorage.getItem("token"))
    return(
    <div className="music-map-container">
        <h1>Music Map</h1>
        {eventMap(events)}
        <EventList events={events}></EventList>

    </div>);
    else
    return(
        <div className="music-map-container">
            <h1>Please login.</h1>
        </div>);
}