import { MapContainer, TileLayer, Marker, Popup, useMapEvent, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { map } from 'leaflet';

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
}

function Refresh({mapLat,mapLong}: Props) {
    const map = useMap()
      map.setView([mapLat, mapLong], map.getZoom())
    return null
  }

let Map = ({mapLat,mapLong}: Props) => {

    
    
    
    return(
    <MapContainer center={[mapLat,mapLong]} zoom={13} scrollWheelZoom={false} >
        <Refresh mapLat={mapLat} mapLong={mapLong}></Refresh>
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[mapLat,mapLong]}>
            <Popup>
            You are <br /> HERE
            </Popup>
        </Marker>
    </MapContainer>
    );
}

export default Map;