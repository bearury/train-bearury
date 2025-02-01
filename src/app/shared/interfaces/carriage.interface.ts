export interface Carriage {
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

export interface CarriageEntity {
  readonly id: string;
  readonly name: string;
  readonly rows: number;
  readonly leftSeats: number;
  readonly rightSeats: number;
  readonly backLeftSeats: number[];
  readonly backRightSeats: number[];
}

export interface CarriageFormValue {
  readonly name: string | null | undefined;
  readonly rows: number | null | undefined;
  readonly leftSeats: number | null | undefined;
  readonly rightSeats: number | null | undefined;
  readonly backLeftSeats: number[] | null | undefined;
  readonly backRightSeats: number[] | null | undefined;
}
