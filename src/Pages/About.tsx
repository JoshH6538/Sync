import '../Styles/About.css';

export default function About() {
    return (
        <div className="about-page-container">
            <div className="about-container">
                <img className="about-img" src='Images/AboutBack.jpg'></img>
                <h1>About Sync</h1>
                <p>
                    Sync is an innovative platform designed to enhance your music experience. By analyzing your Spotify user analytics,
                    Sync curates personalized suggestions for nearby events that align with your music taste.
                </p>
                <p>
                    Discover concerts, festivals, and gatherings tailored to your preferences, and stay connected with the music
                    community around you. Sync bridges the gap between your favorite tunes and unforgettable live experiences.
                </p>
            </div>
        </div>
    );
}
