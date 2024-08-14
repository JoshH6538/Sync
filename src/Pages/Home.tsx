import '../Styles/Home.css'
import TopArtists from "../Components/TopArtists";
import TopTracks from '../Components/TopTracks';
import Spinner from '../Components/Spinner';
interface Props {
    user: any,
    artists: any,
    tracks: any
}

export default function Home({user,artists,tracks}: Props) {
   
    return(
    <div className="home-container">
        <h1>Establishing a community around <span>music</span>.</h1>
        <h2>Welcome {user.name}</h2>
        { artists && artists.length > 0 ?
            <TopArtists artists={artists}></TopArtists> : <Spinner></Spinner>
        }
        <p></p>
        { tracks && tracks.length > 0 ?
            <TopTracks tracks={tracks}></TopTracks> : <p></p>
        }
    </div>);
}