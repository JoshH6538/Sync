import { ReactNode } from "react";
import '../Styles/EventCard.css'

interface Props {
    text: ReactNode,
    img: string,
    altnum: number
}

export default function EventCard({text, img, altnum}: Props) {
  const alt = "card"+{altnum};
  return (
    <>
        <div className="card border-0">
        <div className="row g-0">
            <div className="col-md-4">
            <img src={img} className="card-img-top" alt={alt}></img>
            </div>
            <div className="col-md-8">
            <div className="card-body">
                <p className="card-text">{text}</p>
            </div>
            </div>
        </div>
        </div>
    </>
  )
}
