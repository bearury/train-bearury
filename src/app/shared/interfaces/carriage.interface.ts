export interface Carriage {
  id?: string;
  name: string;
  rows: number;
  leftSeats?: number;
  rightSeats?: number;
}

export interface CarriageVM {
  id?: string;
  name: string;
  rows: SeatVM[][];
  dividerIndex: number;
  columnsCount: number;
  leftSeats?: number;
  rightSeats?: number;
  countSeats: number;
}

export interface Carriage2 {
  readonly id: string;
  readonly name: string;
  readonly matrixIndexSeats: number[][];
  readonly leftSeats: number;
  readonly rightSeats: number;
  readonly backRightSeats: number[];
  readonly backLeftSeats: number[];
}

export interface SeatVM {
  index: number;
}
