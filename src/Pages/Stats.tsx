import '../Styles/Stats.css'
import TopArtists from "../Components/TopArtists";
import TopTracks from '../Components/TopTracks';
import UserTab from '../Components/UserTab';
import Spinner from '../Components/Spinner';
interface Props {
    user: object,
    artists: object,
    tracks: object,
    artistCount: any,
    trackCount: any,
    updateStatCounts: any,
    updateStatTimes: any,
    artistTime: any,
    trackTime: any
    // updateArtistCount: any,
    // updateTracksCount: any
}

export default function Stats({user,artists,tracks, artistCount, trackCount, updateStatCounts, updateStatTimes, artistTime, trackTime}: Props) {
    const setArtistCount = (count:number) => {
        console.log('click')
        updateStatCounts(count,artistCount);
    }
    const setTrackCount = (count:number) => {
        console.log('click')
        updateStatCounts(count,trackCount);
    }
    const setArtistTime = (time:string) => {
        console.log('click')
        updateStatTimes(time,artistTime);
    }
    const setTrackTime = (time:string) => {
        console.log('click')
        updateStatTimes(time,trackTime);
    }
    if(sessionStorage.getItem("token"))
    return(
    <div className="stats-container">
        <h1>Establishing a community around <span>music.</span></h1>
        <UserTab username={user.name} image={user.image}></UserTab>
        {/* <h2>Welcome {user.name}</h2> */}
        { artists && artists.length > 0 ?
            <TopArtists artists={artists} changeCount={setArtistCount} changeTime={setArtistTime} ></TopArtists> : <Spinner></Spinner>
        }
        <p></p>
        { tracks && tracks.length > 0 ?
            <TopTracks tracks={tracks} changeCount={setTrackCount} changeTime={setTrackTime}></TopTracks> : <p></p>
        }
    </div>);
    else
    return(
        <div className="stats-container">
            <div className='Filler'>
                <h1>Please login.</h1>
            </div>
        </div>);
}