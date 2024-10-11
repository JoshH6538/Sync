import '../Styles/EventList.css'

import EventCard from './EventCard';
import LocalEvent from '../LocalEventClass'

interface Props {
    events: LocalEvent[]
}


export default function EventList({events}: Props) {
    let num=0;

  return (
    <div className='eventlist-container'>
        <div className='eventlist-header-container'>
            <h1 className='eventlist-header'>Top Events</h1>
        </div>
        <div className="grid">
        {events.map((event: any) => {
            return(
                <div key={event.id}>
                    {event.image.length > 0 ? <EventCard text={event.name} img={event.image} altnum={num++}></EventCard>
                    : <EventCard text={event.name} img='src\Images\placeholder.jpg' altnum={num++}></EventCard>}
                </div>
            )
        })}
        </div>
    </div>
  )
}
