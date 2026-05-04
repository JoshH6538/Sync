// import "../Styles/TriButton.css";
interface Props {
  color?: "primary" | "secondary" | "dark" | "danger";
  onClick: any;
}

const StatTimeButton = ({ color = "danger", onClick }: Props) => {
  return (
    <div className="count-container d-flex align-items-center">
      <h3 className="mb-0 me-3">Range</h3>
      <div
        className="btn-group tri-button"
        role="group"
        aria-label="Basic example"
      >
        <button
          type="button"
          className={"btn time-btn btn-" + color}
          onClick={() => {
            onClick("short_term");
          }}
        >
          1 Month
        </button>
        <button
          type="button"
          className={"btn time-btn btn-" + color}
          onClick={() => {
            onClick("medium_term");
          }}
        >
          6 Months
        </button>
        <button
          type="button"
          className={"btn time-btn btn-" + color}
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
