

export default function Navbar() {
    return(<>
        <nav className="nav">
            <a href="/" className="site-title">Sync</a>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/GasMap">Gas Map</a></li>
                <li><a href="/About">About</a></li>
            </ul>
        </nav>
    </>);
}