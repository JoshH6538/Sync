// import LocationPrompt from "../Components/LocationPrompt";
import Card from "../Components/Card";
import TopArtists from "../Components/TopArtists";
interface Props {
    user: any,
    artists: any
}

export default function Home({user,artists}: Props) {
   
    return(
    <div className="home-container">
        <h1>Establishing a community around <span>music</span>.</h1>
        <h2>Welcome {user.name}</h2>
        { artists && artists.length > 0 ?
            <TopArtists artists={artists}></TopArtists> : <p>none</p>
        }
    </div>);
}