import { Injectable, signal } from '@angular/core';
import { Carriage, Carriage2, CarriageVM } from '@interfaces/carriage.interface';

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


  public currentCarriage = signal<Carriage2 | null>(null);

  public updateCurrentCarriage = (carriage: Omit<Carriage2, 'matrixIndexSeats'>): void => {
    this.currentCarriage.set(this.buildCurrentCarriage(carriage));
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

  private buildCurrentCarriage({ id, name, leftSeats, rightSeats, backRightSeats, backLeftSeats }: Omit<Carriage2, 'matrixIndexSeats'>): Carriage2 {
    return {
      id,
      name,
      leftSeats,
      rightSeats,
      backRightSeats,
      backLeftSeats,
      matrixIndexSeats: [],
    };
  }
}
