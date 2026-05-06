import LoginPrompt from "../components/LoginPrompt";

interface Props {
  login: () => void;
  logout: () => void;
}

export default function PromptPage({ login, logout }: Props) {
  return (
    <div className="about-page-container">
      <div className="about-container">
        <LoginPrompt login={login} logout={logout}></LoginPrompt>
      </div>
    </div>
  );
}
