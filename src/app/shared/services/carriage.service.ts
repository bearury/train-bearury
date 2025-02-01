import { Injectable } from '@angular/core';
import { Carriage, CarriageEntity, CarriageFormData } from '@interfaces/carriage.interface';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CarriageService {
  // public currentCarriageSignal = signal<Carriage | null>(null);
  public currentCarriage$ = new BehaviorSubject<Carriage | null>(null);

  private _updateMode$ = new BehaviorSubject<boolean>(false);
  public isUpdateMode$ = this._updateMode$.asObservable();

  public setUpdateMode(): void {
    this._updateMode$.next(true);
  }

  public setCreateMode(): void {
    this._updateMode$.next(false);
  }

  public updateCurrentCarriage = (carriage: CarriageFormData): void => {
    this.currentCarriage$.next(this.buildCurrentCarriage(carriage));
  };

  public resetCurrentCarriage(): void {
    this.currentCarriage$.next(null);
  }

  public buildCarriagesEntity = (carriages: CarriageEntity[]): Carriage[] => {
    return carriages.map(entity => this.buildCarriage({
      id: entity.id,
      name: entity.name,
      rows: entity.rows,
      leftSeats: entity.leftSeats,
      rightSeats: entity.rightSeats,
      backLeftSeats: entity.backLeftSeats,
      backRightSeats: entity.backRightSeats,
    }));
  };

  private buildCarriage({ id, name, rows, leftSeats, rightSeats, backRightSeats, backLeftSeats }: CarriageEntity): Carriage {
    return {
      id,
      name,
      leftSeats,
      rightSeats,
      backRightSeats,
      backLeftSeats,
      matrixIndexSeats: this.getMatrixIndexSeats(rows, leftSeats, rightSeats),
    };
  }


  private buildCurrentCarriage({ name, rows, leftSeats, rightSeats, backRightSeats, backLeftSeats }: CarriageFormData): Carriage {
    return {
      id: 'currentCarriage-mockId',
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
