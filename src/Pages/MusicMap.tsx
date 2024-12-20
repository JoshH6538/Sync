import MapWindow from "../Components/MapWindow";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../Information/Constants";
import TicketmasterCredentials from "../Information/Credentials/TicketmasterCredentials";
// import Genres from "../Genres";
import Subgenres from "../Subgenres";
import LocalEvent from "../LocalEventClass";
import LocalVenue from "../LocalVenueClass";
import '../Styles/MusicMap.css'
import EventList from "../Components/EventList";
import EventSettings from "../Components/EventSettings";
import { useDebounce } from "../Scripts/useDebounce";
import { NONAME } from "dns";

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
    //event settings for user to change
    const[radius, setRadius] = useState(0);
    const[radiusUnit, setRadiusUnit] = useState('');

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
        console.log("FETCHED?:",fetched)
        // Base Case: Return if request has already been made
        if(fetched) {console.log("Returning"); return;}
        console.log("RADIUS CHECK:", radius, "\nUNIT CHECK:",radiusUnit)
        // URL used for get request
        let URL = `${Constants.EVENTS_BASE_URL}${TicketmasterCredentials.TICKET_KEY}&latlong=${latitude},${longitude}`;
        if(radius && radius>=5 && radius<=1000) URL+= `&radius=${radius}`;
        // else { console.log("INVALID RADIUS"); return;}
        else URL+= `&radius=100`;
        if(radiusUnit && (radiusUnit==='miles' || radiusUnit=='km') ) URL+= `&unit=${radiusUnit}`;
        // else { console.log("INVALID UNITS"); return;}
        else URL+= `&unit=miles`;
        URL+= `&locale=*&sort=distance,asc`;
        // adds subgenre query to url
        if(genreIds.length>0) {
            URL+="&subGenreId="+genreIds.join(',');
        }
        // GET REQUEST
        console.log(URL)
        console.log("MAKING EVENT REQUEST///////////////////////////////\n///////////////////////")
        
        const {data} = await axios.get(URL,{
        //this is how you set the header, we set it by default upon authentication
        });
        console.log(data.page.totalElements)
        if(data.page.totalElements>0) {
            console.log('UPDATING EVENTS')
            let eventList:LocalEvent[] = [];
            // Creates event object w/ venue object from data for each entry
            data._embedded.events.map((event:any) => {
                let currentVenue = new LocalVenue(event._embedded.venues[0].name, event._embedded.venues[0].location.latitude,event._embedded.venues[0].location.longitude);
                let currentEvent = new LocalEvent(event.name,event.id,event.images[0].url, currentVenue,event.distance, event.url);
                eventList.push(currentEvent);
            })
            setEvents(eventList);
        }
        else {
            alert('No results found. Please adjust your search settings.')
            // console.log('NO EVENTS FOUND');
        }
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

    ////////////////////// EVENT SETTINGS LISTENER ///////////////////////////////////
    interface FormDataValues {
        radius: number;
        unit: string;
      }
    let prevFormData:FormDataValues = {
        radius: -1,
        unit: 'NONE'
    };

    let isListenerAttached = false;

    window.onload = () => {
        const form = document.getElementById('event-settings-form') as HTMLFormElement;
        if (form && !isListenerAttached) {
            form.addEventListener("submit", function (event: Event) {
                event.preventDefault(); // Prevent the default form submission
                const submitButton = document.getElementById('event-settings-submit') as HTMLButtonElement;
                // Disable the submit button temporarily
                if (submitButton) {
                    submitButton.disabled = true;
                }

                const radiusEl = document.getElementById("radius") as HTMLInputElement;
                const unitEl = document.getElementById("radiusUnit") as HTMLInputElement;
                if (radiusEl && unitEl) {
                    const formData:FormDataValues = {
                        radius: Number(radiusEl.value),
                        unit: unitEl.value
                    }
                    let newForm = false;
                    if(formData['radius']!==prevFormData['radius'] || formData['unit']!==prevFormData['unit']) newForm=true;
                    if(newForm){
                        console.log("RADIUS:", radiusEl.value);
                        setRadius(radiusEl.value);
                        console.log("UNIT:", unitEl.value);
                        setRadiusUnit(unitEl.value);
                        prevFormData = formData;
                    }
                    else {
                        alert('Form not submitted: You cannot submit the same form twice.')
                        // console.log("DID NOT SUBMIT: IDENTICAL FORM",formData,prevFormData);
                    }
                    
                } else {
                    console.error("Radius element not found or is not an input field.");
                }
                setTimeout(() => {
                    if (submitButton) {
                      submitButton.disabled = false; // Re-enable button
                    }
                  }, 5000); 
            });
            isListenerAttached = true; // Mark that the listener has been attached
          
        }
        
    }
    ////////////////////// EVENT SETTINGS LISTENER ///////////////////////////////////
    
    React.useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            setlatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
            setPrecision(position.coords.accuracy);
        });
    });


    // Updates genreids on change to genres
    useEffect(() =>{
        getGenreIds();
    },[genres])

    // Updates events when any info is changed
    useEffect(() => {
        // useDebounce(localEvents, 10000);
        localEvents();
    }, [latitude,longitude,precision,genreIds,events]);

    useEffect(() => {
        setFetched(false);
    }, [radius, radiusUnit]);

    useEffect(() => {
        if (!fetched) {
            // useDebounce(localEvents, 10000);
          localEvents();
        }
      }, [fetched]);


    if(sessionStorage.getItem("token"))
    return(
        <>
        {/* <h1 id='page-title'>Music Map</h1> */}
        <h2>Event Settings</h2>
        <EventSettings/>
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