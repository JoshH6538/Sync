import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import Constants from "../Constants";
import axios from "axios";

interface AuthContextType {
  token: string | null;
  login: () => void;
  logout: () => void;
}

const SCOPES_URL_PARAM = Constants.SCOPES.join(Constants.SPACE_DELIM);
const isDev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const redirectURI = isDev
  ? Constants.DEV_REDIRECT_URL_AFTER_LOGIN
  : Constants.REDIRECT_URL_AFTER_LOGIN;

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Provides authentication state and actions (login/logout) to the app.
 * Handles Spotify PKCE flow and token exchange.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    sessionStorage.getItem("token"),
  );
  const hasFetchedToken = useRef(false);

  /**
   * Initiates Spotify OAuth PKCE flow by generating a code verifier/challenge
   * and redirecting the user to the authorization endpoint.
   */
  const login = async () => {
    sessionStorage.removeItem("code_verifier");

    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    sessionStorage.setItem("code_verifier", codeVerifier);

    const location =
      Constants.SPOTIFY_AUTHORIZE_ENDPOINT +
      "?client_id=" +
      import.meta.env.VITE_SPOTIFY_CLIENT_ID +
      "&response_type=code" +
      "&redirect_uri=" +
      encodeURIComponent(redirectURI) +
      "&scope=" +
      SCOPES_URL_PARAM +
      "&code_challenge_method=S256" +
      "&code_challenge=" +
      codeChallenge;

    window.location.href = location;
  };

  const logout = () => {
    setToken(null);
    sessionStorage.clear();
  };

  /**
   * Handles token exchange after Spotify redirects back with an authorization code.
   * Runs once on mount. Prevents duplicate execution in React Strict Mode.
   */
  useEffect(() => {
    if (hasFetchedToken.current) return;

    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) return;

    hasFetchedToken.current = true;

    const fetchToken = async () => {
      try {
        const codeVerifier = sessionStorage.getItem("code_verifier");
        if (!codeVerifier) {
          console.warn("[AUTH] Missing code_verifier. Cannot exchange token.");
          return;
        }

        if (token) {
          return;
        }

        const body = new URLSearchParams({
          client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectURI,
          code_verifier: codeVerifier!,
        });

        const response = await axios.post(
          "https://accounts.spotify.com/api/token",
          body,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          },
        );

        const access_token = response.data.access_token;

        sessionStorage.setItem("token", access_token);
        setToken(access_token);

        // set the URL back to the base path without query params
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      } catch (err: any) {
        console.error("[AUTH] Error:", err?.response?.data || err?.message);
      }
    };

    fetchToken();
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access authentication context.
 * Must be used within AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// === HELPER FUNCTIONS ===
const generateRandomString = (length: number) => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((x) => possible[x % possible.length])
    .join("");
};

const sha256 = async (plain: string) => {
  const encoder = new TextEncoder();
  return await crypto.subtle.digest("SHA-256", encoder.encode(plain));
};

const base64encode = (input: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};
