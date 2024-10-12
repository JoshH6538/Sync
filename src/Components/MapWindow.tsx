import { MapContainer, TileLayer, Marker, Popup, useMapEvent, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { LatLng, LeafletEvent, map } from 'leaflet';
import {useState,useEffect } from 'react';
import LocalVenue from '../LocalVenueClass';
import LocalEvent from '../LocalEventClass';
import '../Styles/Map.css'

// Leaflet.Icon.Default.imagePath =
// '../node_modules/leaflet'


// Leaflet.Icon.Default.mergeOptions({
//     iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//     iconUrl: require('leaflet/dist/images/marker-icon.png'),
//     shadowUrl: require('leaflet/dist/images/marker-shadow.png')
// });
interface Props {
    mapLat: number;
    mapLong: number;
    events: LocalEvent[]
}



let Map = ({mapLat,mapLong, events}: Props) => {

    function LocationMarker() {
        const [position, setPosition] = useState<LatLng>(new LatLng(0,0))
        const map = useMapEvents({
          click() {
            map.locate()
          },
          locationfound(e) {
            setPosition(e.latlng)
            map.flyTo(e.latlng, 10)
          },
        })
      
        return position === null ? null : (
          <Marker position={position}>
            <Popup>You are here</Popup>
          </Marker>
        )
      }

    function Refresh({mapLat,mapLong}: Props) {
        const map = useMap()
          map.setView([mapLat, mapLong], map.getZoom())
        return null
      }
    // useEffect(() => {
    //     eventMarkers(events);
    // })
    return(
    <div className='map-container'>
    <MapContainer center={[mapLat,mapLong]} zoom={8} scrollWheelZoom={false} >
        {/* {LocationMarker()} */}
        <Refresh mapLat={mapLat} mapLong={mapLong} events={events}></Refresh>
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker/>
        {/* <Marker position={[mapLat,mapLong]}>
            <Popup>
            You are <br /> HERE
            </Popup>
        </Marker> */}
        {events.map((event:LocalEvent) => (
            <Marker key={event.id} position={[event.venue.latitude,event.venue.longitude]}>
                <Popup className='pop-up'>
                    {event.name}<br />
                    <img className='marker-img' alt='None' src={event.image}></img>
                    <br/>{event.venue.name}, {event.distance} miles away
                </Popup>
            </Marker>
        ))}
    </MapContainer>
    {/* <br/><h1>Venues</h1><br/>
    {events.map((event:LocalEvent) => (
            <p key={event.id}>{event.name}:<br />{event.venue.name} {event.venue.latitude},{event.venue.longitude}</p>
        ))} */}
    </div>
    );
}

export default Map;