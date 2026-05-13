import LocalVenue from "./LocalVenueClass";
import { TicketmasterRecommendationMetadata } from "./types/ticketmaster";

export default class LocalEvent {
    public name:string;
    public id: string;
    public image:string;
    public venue: LocalVenue;
    public distance: number;
    public url: string;
    public recommendationMetadata?: TicketmasterRecommendationMetadata[];
    public date?: string;
    public time?: string;
    public city?: string;
    public state?: string;

    public constructor(name:string="NULL", id:string="NULL", image:string="", venue:LocalVenue, distance:number, url:string, recommendationMetadata?: TicketmasterRecommendationMetadata[], date?: string, time?: string, city?: string, state?: string){
        this.name = name;
        this.id = id;
        this.image=image;
        this.venue = venue;
        this.distance = distance;
        this.url = url;
        this.recommendationMetadata = recommendationMetadata;
        this.date = date;
        this.time = time;
        this.city = city;
        this.state = state;
    }
};
