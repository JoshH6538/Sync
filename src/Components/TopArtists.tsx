import '../Styles/TopStats.css'

import Card from './Card'
import Button from './Button';
import StatCountButton from './StatCountButton';
import StatTimeButton from './StatTimeButton';

interface Props {
    artists: any,
    changeCount: any,
    changeTime: any
}


export default function TopArtists({artists, changeCount, changeTime}: Props) {
    let num=0;

  return (
    <div className='stats-container'>
        <div className='stats-header-container'>
            <h1 className='stats-header'>Top Artists</h1>
            <StatCountButton onClick={changeCount}></StatCountButton>
            <StatTimeButton onClick={changeTime}></StatTimeButton>
            {/* <Button onClick={() => {changeCount(35)}}>Change Count</Button> */}
        </div>
        <div className="grid">
        {artists.map((artist: any) => {
            return(
                <div key={artist.id}>
                    {artist.images.length > 0 ? <Card text={artist.name} img={artist.images[0].url} altnum={num++}></Card>
                    : <Card text={artist.name} img='src\Images\placeholder.jpg' altnum={num++}></Card>}
                </div>
            )
        })}
        </div>
    </div>
  )
}
