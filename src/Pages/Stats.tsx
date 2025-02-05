import '../Styles/Stats.css'
import TopArtists from "../Components/TopArtists";
import TopTracks from '../Components/TopTracks';
import UserTab from '../Components/UserTab';
import Spinner from '../Components/Spinner';

interface User {
    name: string,
    image: string
}

interface Artist {
    length: number
}
interface Track {
    length: number
}

interface Props {
    user: User,
    artists: Artist[],
    tracks: Track[],
    artistCount: any,
    trackCount: any,
    updateStatCounts: (count: number, type:React.Dispatch<React.SetStateAction<number>>) => void,
    updateStatTimes: (time: string, type:React.Dispatch<React.SetStateAction<string>>) => void,
    artistTime: React.Dispatch<React.SetStateAction<string>>,
    trackTime: React.Dispatch<React.SetStateAction<string>>
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
    <div className="stats-page-container">
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
        <div className="stats-page-container">
            <div className='Filler'>
                {/* <h1>Please login.</h1> */}

            </div>
        </div>);
}