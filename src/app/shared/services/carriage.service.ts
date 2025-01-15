import { Injectable, signal } from '@angular/core';
import { Carriage, Carriage2, CarriageFormData, CarriageVM } from '@interfaces/carriage.interface';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CarriageService {
  public carriagesFromResponseSignal = signal<CarriageVM[]>([{
    id: '',
    rows: [[{ index: 1 }], [{ index: 2 }], [{ index: 3 }], [{ index: 4 }], [{ index: 5 }]],
    name: 'Фейковые данные!',
    columnsCount: 2,
    dividerIndex: 2,
    countSeats: 4,
    leftSeats: 2,
    rightSeats: 2,
  }]);
  // public currentCarriage = signal<Carriage2 | null>(null);
  public currentCarriage$ = new BehaviorSubject<Carriage2 | null>(null);

  public updateCurrentCarriage = (carriage: CarriageFormData): void => {
    this.currentCarriage$.next(this.buildCurrentCarriage(carriage));
  };


  public buildCarriageToVM = (carriage: Carriage): CarriageVM => {
    const { id, name, rows, leftSeats, rightSeats } = carriage;
    const rowsCount = (leftSeats ?? 0) + (rightSeats ?? 0);
    const columnsCount = rows;
    const dividerIndex = (rightSeats ?? 0) - 1;

    return {
      rows: Array.from({ length: rowsCount }).map((row, rowIndex) => {
        return Array.from({ length: columnsCount }).map((item, columnIndex) => {
          return {
            index: (rowsCount - rowIndex) + rowsCount * columnIndex,
          };
        });
      }),
      dividerIndex,
      id,
      name,
      columnsCount,
      countSeats: rowsCount * columnsCount,
      leftSeats,
      rightSeats,
    };
  };

  private buildCurrentCarriage({ name, rows, leftSeats, rightSeats, backRightSeats, backLeftSeats }: CarriageFormData): Carriage2 {

    return {
      id: 'carriage-temp-id',
      name,
      leftSeats,
      rightSeats,
      backRightSeats,
      backLeftSeats,
      matrixIndexSeats: this.getMatrixIndexSeats(rows, leftSeats, rightSeats),
    };
  }

  private getMatrixIndexSeats(rows: number | null, leftSeats: number | null, rightSeats: number | null): number[][] {
    const numberSeatsInRow = (leftSeats ?? 0) + (rightSeats ?? 0);
    return Array.from({ length: numberSeatsInRow }).map((_, rowIndex) => {
      return Array.from({ length: rows ?? 0 }).map((_, columnIndex) =>
        (numberSeatsInRow - rowIndex) + numberSeatsInRow * columnIndex,
      );
    });
  }
}
