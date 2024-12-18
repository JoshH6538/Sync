import { ReactNode } from "react";
import '../Styles/EventCard.css'

interface Props {
    text: ReactNode,
    img: string,
    altnum: number,
    url: string,
    onClick: () => void;
}

export default function EventCard({text, img, altnum, url, onClick}: Props) {
  const alt = "card"+{altnum};
  return (
    <>
        <div id='event-card-border' className="card border-0" onClick={onClick}>
          <div id='event-card-row' className="row g-0">
              <div id='event-card-col1' className="col-md-4">
                <img id='event-card-img' src={img} className="card-img-top" alt={alt}></img>
              </div>
              <div id='event-card-col2' className="col-md-8">
                <div id='event-card-name-container' className="card-body">
                  {typeof(text)==='string' && text.length>20 ? 
                  <p id='event-card-name' className="card-text large-name">{text}</p> 
                  : <p id='event-card-name' className="card-text small-name">{text}</p>}
                </div>
                <button className={"btn btn-danger details"}><a href={url} target="_blank">Details</a></button>
              </div>
          </div>
        </div>
    </>
  )
}
