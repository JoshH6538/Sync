# Sync

Sync is a React/Vite web app that connects Spotify listening taste to live event discovery through Ticketmaster.

Connect Spotify, explore your listening patterns, and find nearby shows that match the artists and genres shaping your taste. Sync also includes a guest demo mode for trying the experience without a Spotify login.

## What Sync Does

Sync turns music taste into event recommendations:

1. Reads top artists and tracks from Spotify.
2. Builds a structured `TasteProfile`.
3. Plans Ticketmaster genre, subgenre, and artist searches.
4. Shows recommended live events on the Music Map.

## Core Features

- Spotify login using OAuth PKCE.
- Guest/demo mode with local fixture data.
- Your Taste page for top artists, tracks, and genre patterns.
- Taste Map visualization for exploring taste relationships.
- Music Map event discovery with location-based search.
- Ticketmaster-powered live event search.
- Artist-triggered event matching from selected artists.

## How It Works

Spotify listening data is normalized into a `TasteProfile` that captures artists, tracks, genres, and graph relationships. Sync then builds a Ticketmaster query plan from that profile, using mapped music genres/subgenres for broad discovery and artist attraction searches when the user selects a specific artist. Music Map combines those results into live event recommendations.

Demo mode uses the same app flow with approved local Spotify/TasteProfile fixture data from `src/data/demo/`.

## Tech Stack

- React
- Vite
- TypeScript
- Spotify Web API
- Ticketmaster Discovery API
- Leaflet / React Leaflet

## Getting Started

Install dependencies:

```powershell
npm install
```

Create a local `.env` file:

```text
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_TICKETMASTER_KEY=your_ticketmaster_api_key
```

Run the dev server:

```powershell
npm.cmd run dev
```

Build for production:

```powershell
npm.cmd run build
```

## Environment Variables

| Variable                      | Required | Purpose                                                    |
| ----------------------------- | -------- | ---------------------------------------------------------- |
| `VITE_SPOTIFY_CLIENT_ID`      | Yes      | Spotify app client ID for OAuth login.                     |
| `VITE_TICKETMASTER_KEY`       | Yes      | Ticketmaster Discovery API key for event search.           |
| `VITE_PAUSE_TICKETMASTER_API` | No       | Set to `true` in local dev to pause Ticketmaster requests. |

Spotify redirect URIs must match the app configuration:

- Local: `http://127.0.0.1:5173/Sync/`
- Deployed: `https://joshh6538.github.io/Sync/`

## Demo Mode

Guest mode uses an approved local fixture committed under `src/data/demo/`. It provides Spotify-style user, top artist, top track, TasteProfile, and Ticketmaster query-plan data so the app can run without a Spotify login.

Demo mode still performs live Ticketmaster searches, so `VITE_TICKETMASTER_KEY` is required for Music Map results.

## Important Notes

- `VITE_TICKETMASTER_KEY` is currently frontend-visible. Move Ticketmaster requests behind a backend/proxy before production.
- Demo fixture data is intentionally committed and may increase bundle size.
- Builds may show a Vite chunk-size warning because the fixture is bundled.
- Sync is under active development and should not be treated as production-ready yet.
