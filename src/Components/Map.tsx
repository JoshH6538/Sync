import { MapContainer, TileLayer, Marker, Popup, useMapEvent, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { map } from 'leaflet';
import { useEffect } from 'react';
import LocalVenue from '../LocalVenueClass';
import LocalEvent from '../LocalEventClass';

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

    function Refresh({mapLat,mapLong}: Props) {
        const map = useMap()
          map.setView([mapLat, mapLong], map.getZoom())
        return null
      }
    // useEffect(() => {
    //     eventMarkers(events);
    // })
    return(
    <>
    <MapContainer center={[mapLat,mapLong]} zoom={8} scrollWheelZoom={false} >
        <Refresh mapLat={mapLat} mapLong={mapLong} events={events}></Refresh>
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[mapLat,mapLong]}>
            <Popup>
            You are <br /> HERE
            </Popup>
        </Marker>
        {events.map((event:LocalEvent) => (
            <Marker key={event.id} position={[event.venue.latitude,event.venue.longitude]}>
                <Popup>
                    {event.name}<br />{event.venue.name}
                </Popup>
            </Marker>
        ))}
    </MapContainer>
    <h1>HELLO</h1>
    {events.map((event:LocalEvent) => (
            <p key={event.id}>{event.name}:<br />{event.venue.name} {event.venue.latitude},{event.venue.longitude}</p>
        ))}
    </>
    );
}

export default Map;