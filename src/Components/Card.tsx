import { ReactNode } from "react";
import "../Styles/Card.css";

interface Props {
  text: ReactNode;
  img: string;
  altnum: number;
}

export default function Card({ text, img, altnum }: Props) {
  const alt = "card" + { altnum };
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
