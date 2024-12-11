export default function About() {
    return (
        <div className="about-container" style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#333' }}>About Me</h1>
            <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.6', marginTop: '1rem' }}>
                Sync is a website that takes in Spotify user analytics and suggests nearby events accordingly.
            </p>
            <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.6', marginTop: '1rem' }}>
                Sync relies on Spotify and Ticketmaster APIs, as well as Leaflet!
            </p>
        </div>
    );
}
