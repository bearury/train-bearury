import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Station } from '@interfaces/station.interface';


@Injectable({
  providedIn: 'root',
})
export class MapService {
  public TEMP_STATION_ID = 'temp_id';
  private _balloons$ = new BehaviorSubject<Station[]>([]);
  public balloons$ = this._balloons$.asObservable();
  private _editMode$ = new BehaviorSubject<boolean>(false);
  public isEditMode$ = this._editMode$.asObservable();


  private get balloons(): Station[] {
    return this._balloons$.getValue();
  }

  public setEditMode(): void {
    this._editMode$.next(true);
  }

  public setViewMode(): void {
    this._editMode$.next(false);
  }

  public addBalloons(balloons: Station[]): void {
    const uniqueObjectArray = new Map<string, Station>();
    this.removeAllConnectedToBalloon();

    [...this.balloons, ...balloons].forEach(balloon => {
      uniqueObjectArray.set(balloon.id, balloon);
    });

    const uniqueStationsArray = Array.from(uniqueObjectArray.values());
    this._balloons$.next([...uniqueStationsArray.values()]);
  }

  public setMainBalloon(balloon: Station): void {
    const connectedToStations = this.balloons.filter((balloon) => balloon.id !== this.TEMP_STATION_ID);
    this._balloons$.next([...connectedToStations, balloon]);
  }

  public removeMainBalloon(): void {
    const connectedToStations = this.balloons.filter((balloon) => balloon.id !== this.TEMP_STATION_ID);
    this._balloons$.next([...connectedToStations]);
  }

  public clearBalloons(): void {
    this._balloons$.next([]);
  }

  private removeAllConnectedToBalloon(): void {
    this._balloons$.next(this.balloons.filter((balloon) => balloon.id === this.TEMP_STATION_ID));
  }


}
