import '../Styles/Home.css'
import TopArtists from "../Components/TopArtists";
import TopTracks from '../Components/TopTracks';
import UserTab from '../Components/UserTab';
import Spinner from '../Components/Spinner';
interface Props {
    user: any,
    artists: any,
    tracks: any,
    artistCount: any,
    trackCount: any,
    updateStatCounts: any
    // updateArtistCount: any,
    // updateTracksCount: any
}

export default function Home({user,artists,tracks, artistCount, trackCount, updateStatCounts}: Props) {
    const setArtistCount = (count:number) => {
        console.log('click')
        updateStatCounts(count,artistCount);
    }
    const setTrackCount = (count:number) => {
        console.log('click')
        updateStatCounts(count,trackCount);
    }
    if(window.localStorage.getItem("token"))
    return(
    <div className="home-container">
        <h1>Establishing a community around <span>music.</span></h1>
        <UserTab username={user.name} image={user.image}></UserTab>
        {/* <h2>Welcome {user.name}</h2> */}
        { artists && artists.length > 0 ?
            <TopArtists artists={artists} changeCount={setArtistCount} ></TopArtists> : <Spinner></Spinner>
        }
        <p></p>
        { tracks && tracks.length > 0 ?
            <TopTracks tracks={tracks} changeCount={setTrackCount}></TopTracks> : <p></p>
        }
    </div>);
    else
    return(
        <div className="home-container">
            <div className='Filler'>
                <h1>Please login.</h1>
            </div>
        </div>);
}