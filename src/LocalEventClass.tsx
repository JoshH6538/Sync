import LocalVenue from "./LocalVenueClass";

export default class LocalEvent {
    public name:string;
    public id: string;
    public imgs:string[];
    public venue: LocalVenue;

    public constructor(name:string="NULL", id:string="NULL", imgs:string[]=[], venue:LocalVenue){
        this.name = name;
        this.id = id;
        this.imgs=imgs;
        this.venue = venue;
    }
};