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

    // Retrieves genre ids from hashmap and sets genreids state
    let getGenreIds = () => {
        let leftovers:string[] = [];
        let ids:string[] = [];
        genres.forEach((genre) => {
            if(genre in Subgenres) {
                ids.push(Subgenres[genre]);
            }
            else {
                leftovers.push(genre);
            }
        })

        // //Adds regular genres to api request V

        // leftovers.forEach((genre) => {
        //     // console.log("Genre:",genre)
        //     if(genre in Genres)
        //     {
        //         // console.log(genre)
        //         ids.push(Genres[genre]);
        //     }
        // })

        setGenreIds(ids);
        return ids;
    }

    // Makes API request to Ticketmaster and populates eventList w/ event objects
    let localEvents = async () => {
        // Base Case: Return if user position has not been retrieved
        if((latitude === 0 && longitude === 0) || genreIds.length<1) return;
        // Base Case: Return if request has already been made
        if(fetched) return;
        // URL used for get request
        let URL = `${Constants.EVENTS_BASE_URL}${TicketmasterCredentials.TICKET_KEY}&latlong=${latitude},${longitude}&radius=100&unit=miles&locale=*&sort=distance,asc`;
        // adds subgenre query to url
        if(genreIds.length>0) {
            URL+="&subGenreId="+genreIds.join(',');
        }
        // GET REQUEST
        const {data} = await axios.get(URL,{
        //this is how you set the header, we set it by default upon authentication
        });
        let eventList:LocalEvent[] = [];
        // Creates event object w/ venue object from data for each entry
        data._embedded.events.map((event:any) => {
            let currentVenue = new LocalVenue(event._embedded.venues[0].name, event._embedded.venues[0].location.latitude,event._embedded.venues[0].location.longitude);
            let currentEvent = new LocalEvent(event.name,event.id,event.images[0].url, currentVenue,event.distance, event.url);
            eventList.push(currentEvent);
        })
        setEvents(eventList);
        setFetched(true);
        return events;
    }

    // Used to show active event
    const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null);
    const [selectedID, setSelectedID] = useState<string | null>(null);

    // Sets new coords on event click
    const handleEventSelect = (lat: number, lng: number, id:string) => {
        setSelectedCoordinates([lat, lng]);
        setSelectedID(id);
    };

    let eventMap = (events:any) => {
        return(
            <>
                <MapWindow mapLat={latitude} mapLong={longitude} events={events} selectedCoordinates={selectedCoordinates} selectedID={selectedID}></MapWindow>
            </>
        );
    }
    
    React.useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            setlatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
            setPrecision(position.coords.accuracy);
        });
    })

    // Updates genreids on change to genres
    useEffect(() =>{
        getGenreIds();
    },[genres])

    // Updates events when any info is changed
    useEffect(() => {
        localEvents();
    }, [latitude,longitude,precision,genreIds,events]);

    if(sessionStorage.getItem("token"))
    return(
        <>
        <h1 id='page-title'>Music Map</h1>
        <div className="music-map-container">
            {eventMap(events)}
            <EventList events={events} onEventSelect={handleEventSelect}></EventList>
        </div>
        </>
    );
    else return(
        <div className="music-map-container">
            <h1>Please login.</h1>
        </div>
    );
}