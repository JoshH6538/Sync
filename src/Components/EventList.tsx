import '../Styles/EventList.css'

import EventCard from './EventCard';
import LocalEvent from '../LocalEventClass'
interface Props {
    events: LocalEvent[]
}


export default function EventList({events}: Props) {
    let num=0;
    console.log(events)
  return (
    <div id='el1' className='eventlist-container'>
        <div id='el2'className='eventlist-header-container'>
            <h1 id='el3' className='eventlist-header'>Top Events</h1>
        </div>
        <div id='el4' className="grid">
        {events.map((event: any) => {
            return(
                <div key={event.id}>

                    {event.image.length > 0 ? <EventCard text={event.name} img={event.image} altnum={num++} url={event.url}></EventCard>
                    : <EventCard text={event.name} img='src\Images\placeholder.jpg' altnum={num++} url={'http://localhost:5173/MusicMap'}></EventCard>}
                </div>
            )
        })}
        <p></p>
        </div>
    </div>
  )
}
