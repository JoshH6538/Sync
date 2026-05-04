import { ReactNode } from "react";
import "../Styles/EventCard.css";

interface Props {
  text: ReactNode;
  img: string;
  altnum: number;
  url: string;
  onClick: () => void;
}

export default function EventCard({ text, img, altnum, url, onClick }: Props) {
  const alt = `card${altnum}`;
  return (
    <div
      className="card border-0 event-card bg-transparent event-hover"
      id="event-card"
      onClick={onClick}
    >
      <div className="row g-0 flex-column flex-md-row">
        {/* Image */}
        <div className="col-md-4">
          <img
            src={img}
            className="card-img-top event-card-img rounded h-100"
            alt={alt}
          />
        </div>

        {/* Text & Button */}
        <div className="col-md-8 d-flex flex-column justify-content-between p-3 text-light">
          <div>
            {typeof text === "string" && text.length >= 50 ? (
              // Truncate if length is greater than or equal to 50 on small screens
              <p
                className="card-text fs-8 text-truncate text-sm-start"
                title={text}
              >
                {text.slice(0, 50)}...{" "}
                {/* Truncate at 50 characters on small screens */}
              </p>
            ) : typeof text === "string" && text.length >= 25 ? (
              // Display normally for text with length between 25 and 50
              <p className="card-text fs-8 text-sm-start">{text}</p>
            ) : (
              // Display normally for text with length less than 25
              <p className="card-text fs-8 text-sm-start">{text}</p>
            )}
          </div>

          <div className="d-flex justify-content-center mt-2">
            <a
              href={url}
              target="_blank"
              className="btn btn-danger w-100"
              onClick={(e) => e.stopPropagation()}
              id="details-button"
            >
              Details
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
