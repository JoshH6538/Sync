import Card from './Card'
import '../Styles/TopStats.css'

interface Props {
    tracks: any
}

export default function TopTracks({tracks}: Props) {
    let num=0;
  return (
    <div className='stats-container'>
         <div className='stats-header-container'>
            <h1 className='stats-header'>Top Tracks</h1>
        </div>
        <div className="grid">
        {tracks.map((track: any) => {
            return(
                <div key={track.id}>
                    <Card text={track.name} img={track.album.images[0].url} altnum={num++}></Card>
                </div>
            )
        })}
        </div>
    </div>
  )
}
