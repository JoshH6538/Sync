import LocalVenue from "./LocalVenueClass";

export default class LocalEvent {
    public name:string;
    public id: string;
    public img:string;
    public venue: LocalVenue;
    public distance: number;

    public constructor(name:string="NULL", id:string="NULL", img:string="", venue:LocalVenue, distance:number){
        this.name = name;
        this.id = id;
        this.img=img;
        this.venue = venue;
        this.distance = distance;
    }
};