import { Inject, Injectable } from '@angular/core';
import { addDoc, collection, Firestore, updateDoc } from '@angular/fire/firestore';
import { LoaderService } from '@services/loader.service';
import { LoaderInPageService } from '@services/loader-in-page.service';
import { catchError, combineLatest, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { Carriage } from '@interfaces/carriage.interface';
import { Station } from '@interfaces/station.interface';
import { StationsFirestoreService } from '@services/firestore/stations.service';
import { CarriageFirestoreService } from '@services/firestore/carriage-firestore.service';
import { TuiAlertService } from '@taiga-ui/core';

@Injectable({
  providedIn: 'root',
})
export class RouteFirestoreService {
  constructor(
    @Inject(Firestore) private readonly db: Firestore,
    @Inject(TuiAlertService) private readonly alert: TuiAlertService,
    @Inject(CarriageFirestoreService) private readonly carriageFirestoreService: CarriageFirestoreService,
    @Inject(StationsFirestoreService) private readonly stationsFirestoreService: StationsFirestoreService,
    @Inject(LoaderService) private readonly loaderService: LoaderService,
    @Inject(LoaderInPageService) private readonly loaderInPageService: LoaderInPageService,
  ) {
  }

  public getStationAndCarriages(): Observable<[Station[], Carriage[]]> {
    this.loaderService.show();
    const stations$: Observable<Station[]> = this.stationsFirestoreService.getAll();
    const carriages$: Observable<Carriage[]> = this.carriageFirestoreService.getAll();

    return combineLatest(stations$, carriages$).pipe(tap(() => this.loaderService.hide()));
  }

  public addRoute(stations: (Station | null)[], carriages: (Carriage | null)[]): Observable<string | null> {
    this.loaderInPageService.show();

    const ref = collection(this.db, 'routes');

    return from(addDoc(ref, {
      carriages: this.removeNullFromArray<Carriage>(carriages).map(carriage => carriage.id),
      stations: this.removeNullFromArray<Station>(stations).map(station => station.id),
    })).pipe(
      switchMap((docRef) => {
        return from(updateDoc(docRef, { id: docRef.id })).pipe(
          map(() => docRef.id),
          tap((id) => {
            this.alert.open('Маршрут успешно создан!').subscribe();
            this.loaderInPageService.hide();
            return of(id);
          }),
          catchError(err => {
            this.alert.open('Ошибка создания маршрута!', err).subscribe();
            this.loaderInPageService.hide();
            return of(null);
          }),
          tap(() => this.loaderInPageService.hide()),
        );
      }));
  }

  private removeNullFromArray<T>(arr: (T | null)[]): T[] {
    return arr.filter(item => item !== null);
  };
}
