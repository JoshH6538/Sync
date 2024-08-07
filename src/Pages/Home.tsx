// import LocationPrompt from "../Components/LocationPrompt";
import Card from "../Components/Card";
interface Props {
    user: any
}

export default function Home({user}: Props) {
   
    return(
    <div className="home-container">
        <h1>Establishing a community around <span>music</span>.</h1>
        <h2>Welcome {user.name}</h2>
        <Card></Card>
    </div>);
}