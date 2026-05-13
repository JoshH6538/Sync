import LoginPrompt from "../components/LoginPrompt";

interface Props {
  onLoginClick: () => void;
  onDemoClick: () => void;
}

export default function PromptPage({ onLoginClick, onDemoClick }: Props) {
  return (
    <div className="about-page-container">
      <div className="about-container">
        <LoginPrompt
          onLoginClick={onLoginClick}
          onDemoClick={onDemoClick}
        ></LoginPrompt>
      </div>
    </div>
  );
}
