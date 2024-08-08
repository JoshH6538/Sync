import { ReactNode } from "react";
import '../Styles/Card.css'

interface Props {
    text: ReactNode,
    img: string,
    altnum: number
}

export default function Card({text, img, altnum}: Props) {
  const alt = "card"+{altnum};
  return (
    <>
        <div className="card">
          <img src={img} className="card-img-top" alt={alt}></img>
          <div className="card-body">
        <p className="card-text">{text}</p>
          </div>
        </div>
    </>
  )
}
