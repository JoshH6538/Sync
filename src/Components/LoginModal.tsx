import { useEffect } from "react";
import "../styles/LoginModal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSpotifyLogin: () => void;
  onDemoLogin: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSpotifyLogin,
  onDemoLogin,
}: Props) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="login-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="login-modal-close"
          aria-label="Close login options"
          onClick={onClose}
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <p className="login-modal-kicker">SYNC ACCESS</p>
        <h2 id="login-modal-title">Start with your music.</h2>
        <p className="login-modal-copy">
          Connect Spotify to build recommendations from your own listening
          history, or try Sync with a guest profile. Spotify access may be
          limited during development.
        </p>

        <div className="login-modal-actions">
          <button type="button" className="login-modal-primary" onClick={onSpotifyLogin}>
            <i className="bi bi-spotify" aria-hidden="true"></i>
            Continue with Spotify
          </button>
          <button type="button" className="login-modal-secondary" onClick={onDemoLogin}>
            <i className="bi bi-person-circle" aria-hidden="true"></i>
            Try guest profile
          </button>
        </div>
      </section>
    </div>
  );
}
