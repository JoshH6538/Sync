const Constants = {
    // Authorization page
    SPOTIFY_AUTHORIZE_ENDPOINT: "https://accounts.spotify.com/authorize",
    //redirect back to site
    REDIRECT_URL_AFTER_LOGIN: "https://joshh6538.github.io",
    // REDIRECT_URL_AFTER_LOGIN: "http://localhost:5173",
    //permissions from api at https://developer.spotify.com/documentation/web-api/concepts/scopes
    SCOPES: ["user-top-read"],
    SPACE_DELIM: "%20",
    EVENTS_BASE_URL: "https://app.ticketmaster.com/discovery/v2/events.json?apikey="
}

export default Constants;