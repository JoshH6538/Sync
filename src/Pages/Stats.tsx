import "../Styles/Stats.css";
import TopArtists from "../components/TopArtists";
import TopTracks from "../components/TopTracks";
import Spinner from "../components/Spinner";
import StatTimeButton from "../components/StatTimeButton";
import StatCountButton from "../components/StatCountButton";
import {
  lazy,
  MutableRefObject,
  RefObject,
  ReactElement,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { TasteProfile } from "../types/taste";
import type {
  ForceGraphProps,
  GraphData,
  NodeObject,
} from "react-force-graph-2d";

const ForceGraph2D = lazy(() => import("react-force-graph-2d")) as unknown as <
  NodeType = {},
  LinkType = {},
>(
  props: ForceGraphProps<NodeType, LinkType> & { ref?: MutableRefObject<any> },
) => ReactElement;

type SpotifyImage = {
  url: string;
};

type User = {
  name: string;
  image: string;
  url: string;
};

type Artist = {
  id: string;
  name: string;
  genres?: string[];
  images: SpotifyImage[];
};

type Track = {
  id: string;
  name: string;
  album: {
    images: SpotifyImage[];
  };
};

type TasteTab = "artists" | "tracks" | "genres";

type GenreSummary = {
  id: string;
  nodeId: string;
  name: string;
  weight: number;
  sourceCount: number;
  artistCount: number;
  trackCount: number;
};

type TasteMapNode = {
  id: string;
  label: string;
  detail: string;
  kind: "artist" | "genre" | "track" | "family";
  weight: number;
  val: number;
  color: string;
  showLabel: boolean;
};

type TasteMapLink = {
  source: string;
  target: string;
  weight: number;
  label: string;
};

type TasteMapData = {
  graphData: GraphData<TasteMapNode, TasteMapLink>;
  artistCount: number;
  genreCount: number;
  trackCount: number;
  connectionCount: number;
  chips: TasteMapChip[];
};

type TasteMapChip = {
  name: string;
  influence: string;
  kind: TasteMapNode["kind"];
};

const MAX_TASTE_MAP_ARTISTS = 50;
const MAX_TASTE_MAP_TRACKS = 50;
const MAX_TASTE_MAP_GENRES = 60;
const MAX_TASTE_MAP_FAMILIES = 10;
const MAX_TASTE_MAP_LINKS = 260;

interface Props {
  user: User;
  artists: Artist[];
  tracks: Track[];
  artistCount: number;
  trackCount: number;
  updateArtistCount: (count: number) => void;
  updateTrackCount: (count: number) => void;
  updateArtistTime: (time: string) => void;
  updateTrackTime: (time: string) => void;
  artistTime: string;
  trackTime: string;
  tasteProfile: TasteProfile | null;
}

export default function Stats({
  user,
  artists,
  tracks,
  artistCount,
  trackCount,
  updateArtistCount,
  updateTrackCount,
  updateArtistTime,
  updateTrackTime,
  artistTime,
  trackTime,
  tasteProfile,
}: Props) {
  const [view, setView] = useState<TasteTab>("artists");
  const [hoveredNode, setHoveredNode] =
    useState<NodeObject<TasteMapNode> | null>(null);
  const [selectedNode, setSelectedNode] =
    useState<NodeObject<TasteMapNode> | null>(null);
  const graphContainerRef = useRef<HTMLDivElement | null>(null);
  const forceGraphRef = useRef<any>();
  const graphSize = useGraphSize(graphContainerRef);
  const topGenres = useMemo(
    () => getTopGenres(artists, tasteProfile),
    [artists, tasteProfile],
  );
  const displayedArtists = useMemo(
    () => artists.slice(0, artistCount),
    [artists, artistCount],
  );
  const displayedTracks = useMemo(
    () => tracks.slice(0, trackCount),
    [tracks, trackCount],
  );
  const tasteMap = useMemo(
    () => getTasteMapData(tasteProfile, artists, tracks, topGenres),
    [tasteProfile, artists, tracks, topGenres],
  );
  const topArtist = artists[0]?.name ?? "your top artists";
  const topTrack = tracks[0]?.name ?? "your top tracks";
  const topGenre = topGenres[0]?.name ?? "your favorite genres";
  const displayTopGenre = toTitleCase(topGenre);
  const tasteRangeText = getTasteRangeText(tasteProfile, artistTime, trackTime);
  const profileReady = artists.length > 0 && tracks.length > 0;
  const activeGraphNode = selectedNode ?? hoveredNode;
  const profileRange = tasteProfile?.source.artistTimeRange ?? artistTime;
  const updateProfileRange = (range: string) => {
    updateArtistTime(range);
    updateTrackTime(range);
  };
  const graphActions = {
    zoomIn: () => {
      const currentZoom = forceGraphRef.current?.zoom?.() ?? 1;
      forceGraphRef.current?.zoom?.(currentZoom * 1.25, 240);
    },
    zoomOut: () => {
      const currentZoom = forceGraphRef.current?.zoom?.() ?? 1;
      forceGraphRef.current?.zoom?.(currentZoom * 0.8, 240);
    },
    reset: () => {
      forceGraphRef.current?.zoomToFit?.(320, 48);
      setSelectedNode(null);
    },
  };

  return (
    <main className="stats-page-container">
      <section className="taste-shell">
        <div className="taste-hero">
          <div className="taste-hero-copy">
            <p className="taste-section-label">Taste Profile</p>
            <h1>Your Taste</h1>
            <p className="taste-hero-summary">
              {profileReady
                ? "Understand the artists, tracks, and genres shaping your taste."
                : "Building your taste profile from Spotify listening data."}
            </p>
            <div className="taste-actions">
              <Link to="/MusicMap" className="primary-btn">
                Explore events based on your taste
              </Link>
              {user.url ? (
                <a
                  href={user.url}
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-btn"
                >
                  Open Spotify profile
                </a>
              ) : null}
            </div>
          </div>

          <aside className="taste-profile-panel" aria-label="Taste summary">
            <div className="taste-user-strip">
              <img src={user.image} alt={user.name} />
              <div>
                <p>Listening as</p>
                <h2>{user.name || "Sync listener"}</h2>
                <span>{tasteRangeText}</span>
              </div>
            </div>

            <div className="taste-signal-list">
              <TasteSignal
                icon="bi-vinyl"
                label="Primary sound"
                value={displayTopGenre}
              />
              <TasteSignal
                icon="bi-music-note-list"
                label="Top Artist"
                value={topArtist}
              />
              <TasteSignal
                icon="bi-cassette"
                label="Top Track"
                value={topTrack}
              />
              <TasteSignal
                icon="bi-compass"
                label="Event Matches"
                value={`${displayTopGenre} based events`}
              />
            </div>

            <div className="taste-profile-note">
              <i className="bi bi-stars"></i>
              <p>
                TasteProfile drives this page and Music Map recommendations.
              </p>
            </div>
          </aside>
        </div>

        <section className="taste-graph-section" aria-label="Taste map">
          <div className="taste-section-heading">
            <div>
              <p className="taste-section-label">Taste Map</p>
              <h2>How your music connects</h2>
              <p>
                Artists, tracks, and genres come from Spotify listening data.
                Bigger circles have more weight in your TasteProfile.
              </p>
            </div>
          </div>
          <p className="taste-map-range">{tasteRangeText}</p>
          <p className="taste-map-note">
            Labels highlight strongest items. Hover any circle for details.
          </p>

          <div className="taste-graph-layout">
            <div className="taste-force-graph" ref={graphContainerRef}>
              <Suspense fallback={<div className="taste-map-loading">Loading Taste Map</div>}>
                <ForceGraph2D<TasteMapNode, TasteMapLink>
                  ref={forceGraphRef}
                  graphData={tasteMap.graphData}
                  width={graphSize.width}
                  height={graphSize.height}
                  backgroundColor="rgba(2, 6, 12, 0)"
                  nodeId="id"
                  nodeVal="val"
                  nodeLabel={(node: NodeObject<TasteMapNode>) => node.label}
                  nodeColor={(node: NodeObject<TasteMapNode>) => node.color}
                  nodeCanvasObject={paintTasteMapNode}
                  nodePointerAreaPaint={paintTasteMapPointerArea}
                  linkSource="source"
                  linkTarget="target"
                  linkWidth={(link: TasteMapLink) =>
                    Math.max(0.8, link.weight * 4.5)
                  }
                  linkColor={(link: TasteMapLink) =>
                    `rgba(103, 232, 249, ${Math.min(0.64, 0.2 + link.weight * 0.62)})`
                  }
                  linkLabel={(link: TasteMapLink) => link.label}
                  linkHoverPrecision={6}
                  d3AlphaDecay={0.045}
                  d3VelocityDecay={0.36}
                  cooldownTicks={90}
                  warmupTicks={30}
                  enableZoomInteraction={false}
                  enablePanInteraction
                  enableNodeDrag
                  showPointerCursor
                  onNodeHover={(node: NodeObject<TasteMapNode> | null) =>
                    setHoveredNode(node)
                  }
                  onNodeClick={(node: NodeObject<TasteMapNode>) =>
                    setSelectedNode(node)
                  }
                  onBackgroundClick={() => setSelectedNode(null)}
                />
              </Suspense>
              <div className="taste-map-legend" aria-label="Taste map legend">
                <span>
                  <i className="legend-dot legend-artist"></i>Artists
                </span>
                <span>
                  <i className="legend-dot legend-genre"></i>Genres
                </span>
                <span>
                  <i className="legend-dot legend-track"></i>Tracks
                </span>
              </div>
              <div className="taste-map-controls" aria-label="Taste map zoom controls">
                <button type="button" onClick={graphActions.zoomIn} aria-label="Zoom in">
                  <i className="bi bi-plus-lg"></i>
                </button>
                <button type="button" onClick={graphActions.zoomOut} aria-label="Zoom out">
                  <i className="bi bi-dash-lg"></i>
                </button>
                <button type="button" onClick={graphActions.reset} aria-label="Reset view">
                  <i className="bi bi-bullseye"></i>
                </button>
              </div>
            </div>

            <div className="taste-graph-details">
              <TasteGraphStat
                label="Artists"
                value={String(tasteMap.artistCount)}
                detail="Artists included from your Spotify taste profile."
              />
              <TasteMetric
                label="Genres"
                value={String(tasteMap.genreCount)}
                detail="Genre patterns connected to artists and tracks."
              />
              <TasteMetric
                label="Taste Connections"
                value={String(tasteMap.connectionCount)}
                detail="Relationships between artists, genres, and tracks."
              />
              <TasteGraphStat
                label="Tracks"
                value={String(tasteMap.trackCount)}
                detail="Top tracks that reinforce your listening patterns."
              />
              <div className="taste-map-active">
                <p>Selected</p>
                <h3>{activeGraphNode?.label ?? "Hover or click the map"}</h3>
                <span>
                  {activeGraphNode
                    ? getSelectedTasteDescription(activeGraphNode)
                    : "See how each artist, genre, or track contributes."}
                </span>
                {activeGraphNode?.kind === "artist" ? (
                  <Link
                    to="/MusicMap"
                    state={{
                      artistEventSearch:
                        getArtistEventSearchStateFromNode(activeGraphNode),
                    }}
                    className="secondary-btn"
                  >
                    See event matches
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
          <div className="taste-map-list" aria-label="Taste map connections">
            <p>Strongest taste factors</p>
            {tasteMap.chips.map((chip) => (
              <span
                className={`taste-chip-${chip.kind}`}
                key={`${chip.kind}-${chip.name}`}
              >
                {chip.name} <small>{chip.influence}</small>
              </span>
            ))}
          </div>
        </section>

        <section className="taste-range-bar" aria-label="Taste range">
          <div>
            <p className="taste-section-label">Taste range</p>
            <h2>{tasteRangeText}</h2>
            <span>Updates the whole TasteProfile: hero, map, and library.</span>
          </div>
          <StatTimeButton
            color="primary"
            label="Choose range"
            value={profileRange}
            onClick={updateProfileRange}
          />
        </section>

        <section className="taste-library">
          <div className="taste-library-header">
            <div>
              <p className="taste-section-label">Taste library</p>
              <h2>Explore your taste</h2>
              {view === "artists" || view === "tracks" ? (
                <span className="taste-library-note">
                  Display count changes this list only.
                </span>
              ) : null}
            </div>
            <div className="taste-library-tools">
              {view === "artists" ? (
                <StatCountButton onClick={updateArtistCount} />
              ) : view === "tracks" ? (
                <StatCountButton onClick={updateTrackCount} />
              ) : null}
              <div className="taste-tabs" role="tablist" aria-label="Taste views">
                <TasteTabButton
                  currentView={view}
                  icon="bi-music-note-list"
                  label="Artists"
                  value="artists"
                  onSelect={setView}
                />
                <TasteTabButton
                  currentView={view}
                  icon="bi-cassette"
                  label="Tracks"
                  value="tracks"
                  onSelect={setView}
                />
                <TasteTabButton
                  currentView={view}
                  icon="bi-vinyl"
                  label="Genres"
                  value="genres"
                  onSelect={setView}
                />
              </div>
            </div>
          </div>

          {view === "artists" ? (
            artists.length > 0 ? (
              <TopArtists
                artists={displayedArtists}
                totalAvailable={artists.length}
              />
            ) : (
              <Spinner />
            )
          ) : view === "tracks" ? (
            tracks.length > 0 ? (
              <TopTracks
                tracks={displayedTracks}
                totalAvailable={tracks.length}
              />
            ) : (
              <Spinner />
            )
          ) : (
            <TopGenres genres={topGenres} />
          )}
        </section>
      </section>
    </main>
  );
}

type TasteMetricProps = {
  label: string;
  value: string;
  detail?: string;
};

function TasteMetric({ label, value, detail }: TasteMetricProps) {
  return (
    <div className="taste-metric">
      <p>{label}</p>
      <h3>{value}</h3>
      {detail ? <span>{detail}</span> : null}
    </div>
  );
}

type TasteSignalProps = {
  icon: string;
  label: string;
  value: string;
};

function TasteSignal({ icon, label, value }: TasteSignalProps) {
  return (
    <div className="taste-signal">
      <i className={`bi ${icon}`}></i>
      <div>
        <p>{label}</p>
        <h3>{value}</h3>
      </div>
    </div>
  );
}

type TasteGraphStatProps = {
  label: string;
  value: string;
  detail: string;
};

function TasteGraphStat({ label, value, detail }: TasteGraphStatProps) {
  return <TasteMetric label={label} value={value} detail={detail} />;
}

type TasteTabButtonProps = {
  currentView: TasteTab;
  icon: string;
  label: string;
  value: TasteTab;
  onSelect: (view: TasteTab) => void;
};

function TasteTabButton({
  currentView,
  icon,
  label,
  value,
  onSelect,
}: TasteTabButtonProps) {
  const isActive = currentView === value;

  return (
    <button
      type="button"
      className={`taste-tab ${isActive ? "is-active" : ""}`}
      onClick={() => onSelect(value)}
      role="tab"
      aria-selected={isActive}
    >
      <i className={`bi ${icon}`}></i>
      {label}
    </button>
  );
}

type TopGenresProps = {
  genres: GenreSummary[];
};

function TopGenres({ genres }: TopGenresProps) {
  if (genres.length < 1) return <Spinner />;

  return (
    <div className="top-genres-grid">
      {genres.map((genre, index) => (
        <div className="top-genre-row" key={genre.name}>
          <span>{index + 1}</span>
          <div>
            <h3>{genre.name}</h3>
            <p>
              {genre.artistCount} artist match{genre.artistCount === 1 ? "" : "es"} /
              {" "}
              {genre.trackCount} track match{genre.trackCount === 1 ? "" : "es"}
            </p>
          </div>
          <small className="genre-strength-label">Influence in your profile</small>
          <div className="genre-strength">
            <div
              aria-label={`Influence in your profile: ${getInfluenceLabel(genre.weight)}`}
              style={{ width: `${Math.min(100, genre.weight * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const getTopGenres = (
  artists: Artist[],
  tasteProfile: TasteProfile | null,
): GenreSummary[] => {
  if (tasteProfile?.subgenres.length) {
    const subgenres = tasteProfile.subgenres
      .slice()
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 12);
    const maxWeight = Math.max(...subgenres.map((genre) => genre.weight), 1);

    return subgenres.map((genre) => ({
      id: genre.id,
      nodeId: genre.nodeId,
      name: toTitleCase(genre.name),
      weight: genre.weight / maxWeight,
      sourceCount: genre.artistIds.length + genre.trackIds.length,
      artistCount: genre.artistIds.length,
      trackCount: genre.trackIds.length,
    }));
  }

  const genreCounts = new Map<string, number>();
  artists.forEach((artist) => {
    artist.genres?.forEach((genre) => {
      genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
    });
  });

  const maxCount = Math.max(...genreCounts.values(), 1);
  return Array.from(genreCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name, count]) => ({
      id: `spotify:genre:${name}`,
      nodeId: `spotify:genre:${name}`,
      name: toTitleCase(name),
      weight: count / maxCount,
      sourceCount: count,
      artistCount: count,
      trackCount: 0,
    }));
};

const getTasteMapData = (
  tasteProfile: TasteProfile | null,
  artists: Artist[],
  tracks: Track[],
  genres: GenreSummary[],
): TasteMapData => {
  const artistNodes = (tasteProfile?.artists ?? artistsToTasteNodes(artists))
    .slice(0, MAX_TASTE_MAP_ARTISTS)
    .map((artist, index) => ({
      id: artist.nodeId,
      label: artist.name,
      detail: "Artist",
      kind: "artist" as const,
      weight: "weight" in artist ? artist.weight : 1,
      val: getNodeValue("weight" in artist ? artist.weight : 1, 11),
      color: "#38bdf8",
      showLabel: index < 6,
    }));
  const sourceSubgenres = tasteProfile?.subgenres ?? genres;
  const genreNodes = sourceSubgenres
    .filter((genre) =>
      "ticketmasterSubGenreId" in genre
        ? !!genre.ticketmasterSubGenreId ||
          !!genre.ticketmasterGenreId ||
          genre.trackIds.length > 0
        : true,
    )
    .slice(0, MAX_TASTE_MAP_GENRES)
    .map((genre, index) => ({
      id: genre.nodeId,
      label: toTitleCase(genre.name),
      detail: "Genre",
      kind: "genre" as const,
      weight: genre.weight,
      val: getNodeValue(genre.weight, 9),
      color: "#2dd4bf",
      showLabel: index < 8,
    }));
  const familyNodes =
    tasteProfile?.broadGenres
      .filter((genre) => genre.name !== "unmapped")
      .slice(0, MAX_TASTE_MAP_FAMILIES)
      .map((genre) => ({
        id: genre.nodeId,
        label: toTitleCase(genre.name),
        detail: "Genre Family",
        kind: "family" as const,
        weight: genre.weight,
        val: getNodeValue(genre.weight, 6),
        color: "#0ea5e9",
        showLabel: false,
      })) ?? [];
  const trackNodes = (tasteProfile?.tracks ?? tracksToTasteNodes(tracks))
    .slice(0, MAX_TASTE_MAP_TRACKS)
    .map((track, index) => ({
      id: track.nodeId,
      label: track.name,
      detail: "Track",
      kind: "track" as const,
      weight: "weight" in track ? track.weight : 0.75,
      val: getNodeValue("weight" in track ? track.weight : 0.75, 7),
      color: "#60a5fa",
      showLabel: index < 5,
    }));
  const nodes = [...artistNodes, ...genreNodes, ...familyNodes, ...trackNodes];
  const nodeIds = new Set(nodes.map((node) => node.id));
  const links =
    tasteProfile?.edges
      .filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, MAX_TASTE_MAP_LINKS)
      .map((edge) => ({
        source: edge.from,
        target: edge.to,
        weight: edge.weight,
        label: getTasteLinkLabel(edge.type),
      })) ?? [];

  return {
    graphData: {
      nodes,
      links: links.length > 0 ? links : getFallbackTasteLinks(nodes),
    },
    artistCount: artistNodes.length,
    genreCount: genreNodes.length,
    trackCount: trackNodes.length,
    connectionCount: links.length > 0 ? links.length : Math.max(nodes.length - 1, 0),
    chips: getTasteMapChips(genreNodes, artistNodes, trackNodes),
  };
};

const getTasteMapChips = (
  genres: TasteMapNode[],
  artists: TasteMapNode[],
  tracks: TasteMapNode[],
): TasteMapChip[] =>
  [...genres, ...artists, ...tracks]
    .filter((node) => node.weight >= 0.32)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 8)
    .map((node) => ({
      name: node.label,
      influence: getInfluenceLabel(node.weight),
      kind: node.kind,
    }));

const getFallbackTasteLinks = (nodes: TasteMapNode[]) =>
  nodes.slice(1).map((node, index) => ({
    source: nodes[0]?.id ?? node.id,
    target: node.id,
    weight: Math.max(0.2, 0.7 - index * 0.04),
    label: "Taste connection",
  }));

const getNodeValue = (weight: number, multiplier: number) =>
  Math.max(4, 4 + weight * multiplier);

const getInfluenceLabel = (weight: number) => {
  if (weight >= 0.75) return "Strong influence";
  if (weight >= 0.5) return "High influence";
  if (weight >= 0.28) return "Medium influence";
  return "Light influence";
};

const getTasteLinkLabel = (type: string) => {
  if (type === "artist_has_genre") return "Artist genre";
  if (type === "track_by_artist") return "Track artist";
  if (type === "track_supports_genre") return "Track genre";
  if (type === "spotify_genre_maps_to_broad_genre") return "Genre family";
  if (type === "spotify_genre_maps_to_ticketmaster_subgenre") {
    return "Event category";
  }
  return "Taste connection";
};

const useGraphSize = (ref: RefObject<HTMLDivElement>) => {
  const [size, setSize] = useState({ width: 720, height: 430 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => {
      const width = Math.max(320, Math.floor(element.clientWidth));
      const height = width < 560 ? 360 : 430;
      setSize({ width, height });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [ref]);

  return size;
};

const paintTasteMapNode = (
  node: NodeObject<TasteMapNode>,
  ctx: CanvasRenderingContext2D,
  globalScale: number,
) => {
  const radius = Math.sqrt(node.val ?? 4) * 2.65;
  const label = node.label ?? "";
  const fontSize = Math.max(3.4, 11 / globalScale);

  ctx.beginPath();
  ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = node.color ?? "#38bdf8";
  ctx.globalAlpha = Math.min(0.92, 0.34 + (node.weight ?? 0.5) * 0.52);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1.2 / globalScale;
  ctx.strokeStyle = `rgba(226, 232, 240, ${Math.min(0.74, 0.28 + (node.weight ?? 0.5) * 0.44)})`;
  ctx.stroke();

  if (node.showLabel) {
    ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(226, 232, 240, 0.92)";
    ctx.fillText(truncateGraphLabel(label), node.x ?? 0, (node.y ?? 0) + radius + 3);
  }
};

const paintTasteMapPointerArea = (
  node: NodeObject<TasteMapNode>,
  color: string,
  ctx: CanvasRenderingContext2D,
) => {
  const radius = Math.sqrt(node.val ?? 4) * 3.8;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, 2 * Math.PI, false);
  ctx.fill();
};

const truncateGraphLabel = (label: string) =>
  label.length > 18 ? `${label.slice(0, 16)}...` : label;

const artistsToTasteNodes = (artists: Artist[]) =>
  artists.map((artist, index) => ({
    ...artist,
    nodeId: `spotify:artist:${artist.id}`,
    weight: Math.max(0.25, 1 - index * 0.05),
  }));

const tracksToTasteNodes = (tracks: Track[]) =>
  tracks.map((track, index) => ({
    ...track,
    nodeId: `spotify:track:${track.id}`,
    weight: Math.max(0.25, 1 - index * 0.05),
  }));

const toTitleCase = (value: string) =>
  value.replace(/\b([a-z])/g, (letter) => letter.toUpperCase());

const formatRangeLabel = (range: string) => {
  if (range === "short_term") return "Last month";
  if (range === "medium_term") return "Last 6 months";
  if (range === "long_term") return "Last year";
  return "Current range";
};

const getTasteRangeText = (
  tasteProfile: TasteProfile | null,
  artistTime: string,
  trackTime: string,
) => {
  const artistRange = formatRangeLabel(
    tasteProfile?.source.artistTimeRange ?? artistTime,
  );
  const trackRange = formatRangeLabel(
    tasteProfile?.source.trackTimeRange ?? trackTime,
  );

  if (artistRange === trackRange) {
    return `Based on your ${artistRange.toLowerCase()} Spotify taste`;
  }

  return `Based on ${artistRange.toLowerCase()} artists and ${trackRange.toLowerCase()} tracks`;
};

const getSelectedTasteDescription = (node: NodeObject<TasteMapNode>) => {
  if (node.kind === "artist") {
    return `${node.label} contributes through your top artists.`;
  }
  if (node.kind === "genre") {
    return `${node.label} contributes through your genre matches.`;
  }
  if (node.kind === "track") {
    return `${node.label} contributes through your top tracks.`;
  }
  if (node.kind === "family") {
    return `${node.label} connects related genres in your taste profile.`;
  }

  return "This item contributes to your taste profile.";
};

const getArtistEventSearchStateFromNode = (node: NodeObject<TasteMapNode>) => ({
  artistId: String(node.id ?? "").replace(/^spotify:artist:/, ""),
  artistName: String(node.label ?? ""),
  artistNodeId: String(node.id ?? ""),
  keyword: String(node.label ?? ""),
  weight: node.weight ?? 1,
});
