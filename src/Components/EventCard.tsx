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
        <div id='ec1' className="card border-0">
        <div id='ec2' className="row g-0">
            <div id='ec3' className="col-md-4">
            <img id='ec4' src={img} className="card-img-top" alt={alt}></img>
            </div>
            <div id='ec5' className="col-md-8">
            <div id='ec6' className="card-body">
                <p id='ec7' className="card-text">{text}</p>
            </div>
            </div>
        </div>
        </div>
    </>
  )
}
