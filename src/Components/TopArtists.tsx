import "../Styles/TopStats.css";

import Card from "./Card";
import StatCountButton from "./StatCountButton";
import StatTimeButton from "./StatTimeButton";

interface Props {
  artists: any;
  displayLimit: number;
  totalAvailable: number;
  changeCount: any;
  changeTime: any;
}

export default function TopArtists({
  artists,
  displayLimit,
  totalAvailable,
  changeCount,
  changeTime,
}: Props) {
  let num = 0;

  return (
    <>
      <div className="stats-container container">
        <div className="row mb-1 rounded-3 md-px-5 sm-px-2 px-2 stats-header-container">
          <div className="col-12 text-center">
            <h1 className="mb-2 mt-1 top-stats-title">
              <i className="bi bi-music-note-list"></i> Top Artists
            </h1>
            <p className="top-stats-context">
              Showing {artists.length} of {totalAvailable} available artists
              {totalAvailable < displayLimit ? ` (Spotify returned ${totalAvailable})` : ""}
            </p>

            {/* Button Section */}
            <div className="row mb-3">
              <div className="col-12 d-flex flex-column flex-md-row justify-content-md-between align-items-center gap-2">
                <div className="d-flex justify-content-center justify-content-md-start w-sm-100 w-auto">
                  <StatCountButton onClick={changeCount} />
                </div>
                <div className="d-flex justify-content-center justify-content-md-end w-sm-100 w-auto">
                  <StatTimeButton onClick={changeTime} />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* <div className="stats-header-container d-flex flex-wrap align-items-center gap-2 mb-3">
        <h1 className="stats-header mb-0">Top Artists |</h1>
        <StatCountButton onClick={changeCount} />
        <StatTimeButton onClick={changeTime} />
      </div> */}

        <div className="row px-2 py-2">
          {artists.map((artist: any, index: number) => (
            <div
              key={artist.id}
              className="col-6 col-sm-4 col-md-3 col-lg-2 mb-4 d-flex"
            >
              <Card
                text={artist.name}
                img={
                  artist.images.length > 0
                    ? artist.images[0].url
                    : "src/Images/placeholder.jpg"
                }
                altnum={num++}
                actionLabel="Explore event matches"
                actionTo="/MusicMap"
                actionState={{
                  artistEventSearch: {
                    artistId: artist.id,
                    artistName: artist.name,
                    artistNodeId: `spotify:artist:${artist.id}`,
                    keyword: artist.name,
                    weight: Math.max(0.25, 1 - index * 0.05),
                  },
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
    // <div className='stats-container'>
    //     <div className='stats-header-container'>
    //         <h1 className='stats-header'>Top Artists |</h1>
    //         <StatCountButton onClick={changeCount}></StatCountButton>
    //         <StatTimeButton onClick={changeTime}></StatTimeButton>
    //         {/* <Button onClick={() => {changeCount(35)}}>Change Count</Button> */}
    //     </div>
    //     <div className="grid">
    //     {artists.map((artist: any) => {
    //         return(
    //             <div key={artist.id}>
    //                 {artist.images.length > 0 ? <Card text={artist.name} img={artist.images[0].url} altnum={num++}></Card>
    //                 : <Card text={artist.name} img='src\Images\placeholder.jpg' altnum={num++}></Card>}
    //             </div>
    //         )
    //     })}
    //     </div>
    // </div>
  );
}
