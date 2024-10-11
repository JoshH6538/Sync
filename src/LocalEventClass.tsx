import LocalVenue from "./LocalVenueClass";

export default class LocalEvent {
    public name:string;
    public id: string;
    public image:string;
    public venue: LocalVenue;
    public distance: number;

    public constructor(name:string="NULL", id:string="NULL", image:string="", venue:LocalVenue, distance:number){
        this.name = name;
        this.id = id;
        this.image=image;
        this.venue = venue;
        this.distance = distance;
    }
};