import "../Styles/About.css";

export default function Privacy() {
  return (
    <div className="about-page-container">
      <div className="about-container">
        <img
          className="about-img"
          src="Images/AboutBack.jpg"
          alt="Privacy Background"
        />
        <h1>Privacy Policy</h1>
        <p>
          Sync uses Spotify authentication to access your top artists, tracks,
          and profile data. This information is used solely to provide you with
          personalized event recommendations based on your music preferences.
        </p>
        <p>
          We do not store, sell, or share any of your Spotify data. All
          processing is done client-side during your active session. Once you
          close the browser tab or log out, all session data is cleared.
        </p>
        <p>
          Sync does not collect or retain any personally identifiable
          information beyond what Spotify provides during your session. We use
          this access to enrich your user experience and do not persist any user
          data on a server or database.
        </p>
        <p>
          If you are using Sync in Guest Mode, no data is collected or accessed
          from Spotify.
        </p>
        <p>
          By using Sync, you agree to Spotify's Terms of Service and our usage
          of their Web API under Spotify's developer policies.
        </p>
      </div>
    </div>
  );
}
