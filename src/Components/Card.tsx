import { ReactNode } from "react";
import { Link } from "react-router-dom";
import "../Styles/Card.css";

interface Props {
  text: ReactNode;
  img: string;
  altnum: number;
  actionLabel?: string;
  actionTo?: string;
  actionState?: unknown;
}

export default function Card({
  text,
  img,
  altnum,
  actionLabel,
  actionTo,
  actionState,
}: Props) {
  const alt = `card-${altnum}`;
  return (
    <div className="text-center text-truncate hover-grow">
      <div className="position-relative">
        <img
          src={img}
          alt={alt}
          className="img-fluid border border-dark shadow rounded mb-2"
        />
        {/* Number Overlay */}
        <div className="number-overlay">{altnum + 1}</div>
      </div>

      <p className="mb-0 text-truncate" style={{ maxWidth: "100%" }}>
        {text}
      </p>
      {actionLabel && actionTo ? (
        <Link to={actionTo} state={actionState} className="card-action-link">
          {actionLabel}
        </Link>
      ) : null}
    </div>

    // <>
    //     <div className="card border-0">
    //       <img src={img} className="card-img-top" alt={alt}></img>
    //       <div className="card-body">
    //           <p className="card-text">{text}</p>
    //       </div>
    //     </div>
    // </>
  );
}
