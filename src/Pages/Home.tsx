import "../styles/Home.css";

export default function Home() {
  return (
    <>
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">Turn your music into live experiences</h1>

          <p className="hero-subtext">
            Connect your Spotify and find real events near you, tailored to what
            you love.
          </p>

          <div className="hero-actions">
            <button className="primary-btn">Try Demo</button>
            <button className="secondary-btn">Login with Spotify</button>
          </div>
        </div>
      </div>

      <div className="value-section">
        <h2 className="value-title">How it works</h2>

        <div className="value-grid">
          <div className="value-item">
            <i className="bi bi-spotify value-icon"></i>
            <h3>Connect your Spotify</h3>
            <p>Securely link your account to access your music taste.</p>
          </div>

          <div className="value-item">
            <i className="bi bi-graph-up value-icon"></i>
            <h3>Analyze your taste</h3>
            <p>We use your top artists and genres to understand your vibe.</p>
          </div>

          <div className="value-item">
            <i className="bi bi-calendar-event value-icon"></i>
            <h3>Find events near you</h3>
            <p>Discover concerts and events tailored to what you love.</p>
          </div>
        </div>
      </div>
    </>
  );
}
