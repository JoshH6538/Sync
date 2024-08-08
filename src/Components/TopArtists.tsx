import Card from './Card'
import '../Styles/TopArtists.css'

interface Props {
    artists: any
}

export default function TopArtists({artists}: Props) {
    let num=0;
  return (
    <>
        <h1>Top Artists</h1>
        <div className="grid">
        {artists.map((artist: any) => {
            return(
                <div key={artist.id}>
                    <Card text={artist.name} img={artist.images[0].url} altnum={num++}></Card>
                </div>
            )
        })}
        </div>
    </>
  )
}
