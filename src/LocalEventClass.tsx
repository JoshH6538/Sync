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

    public constructor(name:string="NULL", id:string="NULL", image:string="", venue:LocalVenue, distance:number, url:string, recommendationMetadata?: TicketmasterRecommendationMetadata[]){
        this.name = name;
        this.id = id;
        this.image=image;
        this.venue = venue;
        this.distance = distance;
        this.url = url;
        this.recommendationMetadata = recommendationMetadata;
    }
};
