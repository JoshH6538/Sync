import { ReactNode } from "react";
import '../Styles/EventCard.css'

interface Props {
    text: ReactNode,
    img: string,
    altnum: number,
    url: string
}

export default function EventCard({text, img, altnum, url}: Props) {
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
              {typeof(text)==='string' && text.length>20 ? 
              <p id='ec7' className="card-text large-name">{text}</p> 
              : <p id='ec7' className="card-text small-name">{text}</p>}
                
            </div>
            <button className={"btn btn-danger details"}><a href={url} target="_blank">Details</a></button>
            </div>
        </div>
        </div>
    </>
  )
}
