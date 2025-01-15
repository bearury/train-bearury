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
  readonly name: string | null;
  readonly matrixIndexSeats: number[][];
  readonly leftSeats: number | null;
  readonly rightSeats: number | null;
  readonly backRightSeats: number[];
  readonly backLeftSeats: number[];
}

export interface CarriageFormData {
  readonly name: string | null;
  readonly rows: number | null;
  readonly leftSeats: number | null;
  readonly rightSeats: number | null;
  readonly backLeftSeats: number[];
  readonly backRightSeats: number[];
}

export interface SeatVM {
  index: number;
}
