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
        console.log("GENRES------------------------------------\n")
        let leftovers:string[] = [];
        let ids:string[] = [];
        genres.forEach((genre) => {
            // console.log("Genre: ",genre, "in subgenre?:", genre in Subgenres)
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
        console.log("SUBGENRES:", ids);

        //Adds regular genres to api request V

        // leftovers.forEach((genre) => {
        //     // console.log("Genre:",genre)
        //     if(genre in Genres)
        //     {
        //         // console.log(genre)
        //         ids.push(Genres[genre]);
        //     }
        // })
        // console.log("IDS------------------------------------\n",genres)
        setGenreIds(ids);
        return ids;
    }
    let localEvents = async () => {
        if((latitude === 0 && longitude === 0) || genreIds.length<1) return;
        if(fetched) return;
        let URL = `${Constants.EVENTS_BASE_URL}${TicketmasterCredentials.TICKET_KEY}&latlong=${latitude},${longitude}&radius=100&unit=miles&locale=*&sort=distance,asc`;
        if(genreIds.length>0)
        {
            console.log("specific")
            URL+="&subGenreId="+genreIds.join(',');
            console.log(URL)
        }
        const {data} = await axios.get(URL,{
        //this is how you set the header, we set it by default upon authentication
        });
        console.log("HERE:",data);
        let eventList:LocalEvent[] = [];
        // let count = 0;
        data._embedded.events.map((event:any) => {
            // console.log(count)
            // if(count<1) {
            // console.log(event.name,event.images[0],event._embedded.venues[0])
                let currentVenue = new LocalVenue(event._embedded.venues[0].name, event._embedded.venues[0].location.latitude,event._embedded.venues[0].location.longitude);
                let currentEvent = new LocalEvent(event.name,event.id,event.images[0].url, currentVenue,event.distance, event.url);
                console.log('URL:',event.url)
                eventList.push(currentEvent);
            // }
            // count++
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


    

    if(sessionStorage.getItem("token"))
    return(
    <><h1 id='page-title'>Music Map</h1>
    <div className="music-map-container">
        {eventMap(events)}
        <EventList events={events}></EventList>

    </div></>);
    else
    return(
        <div className="music-map-container">
            <h1>Please login.</h1>
        </div>);
}