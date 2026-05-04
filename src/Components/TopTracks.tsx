import "../Styles/TopStats.css";
import Card from "./Card";
import StatCountButton from "./StatCountButton";
import StatTimeButton from "./StatTimeButton";

interface Props {
  tracks: any;
  changeCount: any;
  changeTime: any;
}

export default function TopTracks({ tracks, changeCount, changeTime }: Props) {
  let num = 0;

  return (
    <div className="stats-container container">
      <div className="row mb-1 rounded-3 md-px-5 sm-px-2 px-2 stats-header-container">
        <div className="col-12 text-center">
          <h1 className="mb-2 mt-1 top-stats-title">
            <i className="bi bi-cassette"></i> Top Tracks
          </h1>

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

      {/* Track Cards */}
      <div className="row px-2 py-2">
        {tracks.map((track: any) => (
          <div
            key={track.id}
            className="col-6 col-sm-4 col-md-3 col-lg-2 mb-4 d-flex"
          >
            <Card
              text={track.name}
              img={
                track.album.images.length > 0
                  ? track.album.images[0].url
                  : "src/Images/placeholder.jpg"
              }
              altnum={num++}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
