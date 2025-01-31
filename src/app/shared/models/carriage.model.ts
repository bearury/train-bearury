export class CarriageModel {
  public id: string;
  public name: string;
  public rows: number;
  public leftSeats: number;
  public rightSeats: number;
  public backLeftSeats: number[];
  public backRightSeats: number[];


  constructor(id: string, name: string, rows: number, leftSeats: number, rightSeats: number, backLeftSeats: number[], backRightSeats: number[]) {
    this.id = id;
    this.name = name;
    this.rows = rows;
    this.leftSeats = leftSeats;
    this.rightSeats = rightSeats;
    this.backLeftSeats = backLeftSeats;
    this.backRightSeats = backRightSeats;
  }
}
