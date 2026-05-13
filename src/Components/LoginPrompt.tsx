import "../styles/LoginPrompt.css";

interface Props {
  onLoginClick: () => void;
  onDemoClick: () => void;
}

const LoginPrompt = ({ onLoginClick, onDemoClick }: Props) => {
  return (
    <div className="lg-container">
      <p className="lg-kicker">Sync locked</p>
      <h2 className="lg-message">Log in or try demo mode.</h2>
      <p className="lg-copy">
        Spotify builds from your listening data. Demo mode uses approved local
        fixture data.
      </p>
      <div className="lg-actions">
        <button className="lg-button primary" onClick={onLoginClick}>
          Login
        </button>
        <button className="lg-button secondary" onClick={onDemoClick}>
          Try demo
        </button>
      </div>
    </div>
  );
};

export default LoginPrompt;
