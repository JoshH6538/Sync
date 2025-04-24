import "../Styles/About.css";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="about-page-container">
      <div className="about-container">
        <img
          className="about-img"
          src="Images/AboutBack.jpg"
          alt="About Sync Background"
        />
        <h1>About Sync</h1>
        <p>
          Sync is a music-powered discovery platform that connects your Spotify
          listening habits with live event experiences. Using Spotify’s Web API,
          Sync analyzes your top artists, tracks, and genres to recommend
          real-world concerts and music events near you, powered by
          Ticketmaster.
        </p>
        <p>
          Whether you're into indie, hip hop, pop, or folk, Sync curates
          personalized events so you never miss a show that fits your vibe. With
          a responsive design, map integration, and guest mode access, Sync lets
          you explore events effortlessly—even without a Spotify login.
        </p>
        <p>
          Your data is never stored or shared. Sync simply enhances your
          listening experience by helping you turn tracks into memories.
        </p>
        <div className="text-center mt-4">
          <p className="small mb-1">
            <strong>User data</strong> provided by{" "}
            <a href="https://spotify.com" target="_blank" rel="noreferrer">
              Spotify
            </a>
            .
          </p>
          <p className="small mb-1">
            <strong>Event data</strong> provided by{" "}
            <a href="https://ticketmaster.com" target="_blank" rel="noreferrer">
              Ticketmaster
            </a>
            .
          </p>
          <p className="small">
            By continuing, you agree to our{" "}
            <Link to="/Privacy">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
