export default class LocalVenue {
    public name:string;
    public latitude: number;
    public longitude: number;
    // address: string;
    // city: string;
    // country: string;
    // distance: number;
    public constructor(name:string="NULL", latitude:number=0, longitude:number=0) {
        this.name = name;
        this.latitude=latitude;
        this.longitude=longitude;
    }
};