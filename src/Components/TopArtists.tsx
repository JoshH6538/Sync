import Card from './Card'
import '../Styles/TopStats.css'

interface Props {
    artists: any
}

export default function TopArtists({artists}: Props) {
    let num=0;
  return (
    <div className='stats-container'>
        <div className='stats-header-container'>
            <h1 className='stats-header'>Top Artists</h1>
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
