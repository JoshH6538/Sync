import "../Styles/Stats.css";
import TopArtists from "../Components/TopArtists";
import TopTracks from "../Components/TopTracks";
import UserTab from "../Components/UserTab";
import Spinner from "../Components/Spinner";
import { useState } from "react";

interface User {
  name: string;
  image: string;
  url: string;
}

interface Artist {
  length: number;
}
interface Track {
  length: number;
}

interface Props {
  user: User;
  artists: Artist[];
  tracks: Track[];
  artistCount: any;
  trackCount: any;
  updateStatCounts: (
    count: number,
    type: React.Dispatch<React.SetStateAction<number>>
  ) => void;
  updateStatTimes: (
    time: string,
    type: React.Dispatch<React.SetStateAction<string>>
  ) => void;
  artistTime: React.Dispatch<React.SetStateAction<string>>;
  trackTime: React.Dispatch<React.SetStateAction<string>>;
}

export default function Stats({
  user,
  artists,
  tracks,
  artistCount,
  trackCount,
  updateStatCounts,
  updateStatTimes,
  artistTime,
  trackTime,
}: Props) {
  const [view, setView] = useState<"artists" | "tracks">("artists"); // Track which view is active

  const setArtistCount = (count: number) => {
    updateStatCounts(count, artistCount);
  };

  const setTrackCount = (count: number) => {
    updateStatCounts(count, trackCount);
  };

  const setArtistTime = (time: string) => {
    updateStatTimes(time, artistTime);
  };

  const setTrackTime = (time: string) => {
    updateStatTimes(time, trackTime);
  };

  if (sessionStorage.getItem("token"))
    return (
      <div className="stats-page-container">
        <h1>
          Establishing a community around <span>music.</span>
        </h1>
        <UserTab username={user.name} image={user.image} url={user.url} />

        {/* Toggle Buttons */}
        <div className="d-flex justify-content-center mb-4">
          <button
            className={`btn ${
              view === "artists" ? "btn-danger text-white" : "btn-secondary"
            } me-3`}
            onClick={() => setView("artists")}
          >
            <i
              className={`bi bi-music-note-list ${
                view === "artists" ? "text-white" : "text-dark"
              }`}
            ></i>
            <span
              className={`${view === "artists" ? "text-white" : "text-dark"}`}
            >
              Top Artists
            </span>
          </button>

          <button
            className={`btn ${
              view === "tracks" ? "btn-danger text-white" : "btn-secondary"
            }`}
            onClick={() => setView("tracks")}
          >
            <i
              className={`bi bi-cassette ${
                view === "tracks" ? "text-white" : "text-dark"
              }`}
            ></i>
            <span
              className={`${view === "tracks" ? "text-white" : "text-dark"}`}
            >
              Top Tracks
            </span>
          </button>
        </div>

        {/* Conditional Rendering Based on View */}
        {view === "artists" ? (
          artists && artists.length > 0 ? (
            <TopArtists
              artists={artists}
              changeCount={setArtistCount}
              changeTime={setArtistTime}
            />
          ) : (
            <Spinner />
          )
        ) : tracks && tracks.length > 0 ? (
          <TopTracks
            tracks={tracks}
            changeCount={setTrackCount}
            changeTime={setTrackTime}
          />
        ) : (
          <Spinner />
        )}
      </div>
    );
  else
    return (
      <div className="stats-page-container">
        <div className="Filler">{/* <h1>Please login.</h1> */}</div>
      </div>
    );
}
