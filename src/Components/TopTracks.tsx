import '../Styles/TopStats.css'

import Card from './Card'
import Button from './Button'
import StatCountButton from './StatCountButton'
import StatTimeButton from './StatTimeButton'

interface Props {
    tracks: any,
    changeCount: any,
    changeTime: any
}

export default function TopTracks({tracks, changeCount, changeTime}: Props) {
    let num=0;
  return (
    <div className='stats-container'>
         <div className='stats-header-container'>
            <h1 className='stats-header'>Top Tracks</h1>
            <StatCountButton onClick={changeCount}></StatCountButton>
            <StatTimeButton onClick={changeTime}></StatTimeButton>
            {/* <Button onClick={() => {changeCount(35)}}>Change Count</Button> */}
        </div>
        <div className="grid">
        {tracks.map((track: any) => {
            return(
                <div key={track.id}>
                    {track.album.images.length > 0 ? <Card text={track.name} img={track.album.images[0].url} altnum={num++}></Card>
                    : <Card text={track.name} img='src\Images\placeholder.jpg' altnum={num++}></Card>}
                    {/* <Card text={track.name} img={track.album.images[0].url} altnum={num++}></Card> */}
                </div>
            )
        })}
        </div>
    </div>
  )
}
