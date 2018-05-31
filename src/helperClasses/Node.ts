export class Node {

    next : Node;
    data : number[];

    constructor(coordinates : number[]){
        this.data = coordinates;
        this.next = null;
    }
    public get x() : number{
        return this.data[0];
    }
    public get y() : number{
        return this.data[1];
    }
    public set x(newX : number){
        this.data[0] = newX;
    }
    public set y(newY : number){
        this.data[1] = newY;
    }
}