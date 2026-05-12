// import "../Styles/TriButton.css";
interface Props {
  color?: "primary" | "secondary" | "dark" | "danger";
  onClick: any;
  value?: string;
  label?: string;
}

const StatTimeButton = ({
  color = "danger",
  onClick,
  value,
  label = "Range",
}: Props) => {
  return (
    <div className="count-container d-flex align-items-center">
      <h3 className="mb-0 me-3">{label}</h3>
      <div
        className="btn-group tri-button"
        role="group"
        aria-label={label}
      >
        <button
          type="button"
          className={`btn time-btn btn-${color} ${
            value === "short_term" ? "is-active" : ""
          }`}
          onClick={() => {
            onClick("short_term");
          }}
        >
          1 Month
        </button>
        <button
          type="button"
          className={`btn time-btn btn-${color} ${
            value === "medium_term" ? "is-active" : ""
          }`}
          onClick={() => {
            onClick("medium_term");
          }}
        >
          6 Months
        </button>
        <button
          type="button"
          className={`btn time-btn btn-${color} ${
            value === "long_term" ? "is-active" : ""
          }`}
          onClick={() => {
            onClick("long_term");
          }}
        >
          1 Year
        </button>
      </div>
    </div>
  );
};

export default StatTimeButton;
