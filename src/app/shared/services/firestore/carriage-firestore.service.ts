import { Inject, Injectable } from '@angular/core';
import { Carriage, CarriageEntity, CarriageFormValue } from '@interfaces/carriage.interface';
import { catchError, first, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { LoaderService } from '@services/loader.service';
import { LoaderInPageService } from '@services/loader-in-page.service';
import { CarriageService } from '@services/carriage.service';
import { TuiAlertService } from '@taiga-ui/core';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';

@Injectable({
  providedIn: 'root',
})
export class CarriageFirestoreService {


  constructor(
    @Inject(Firestore) private readonly db: Firestore,
    @Inject(TuiAlertService) private readonly alert: TuiAlertService,
    @Inject(CarriageService) private readonly carriageService: CarriageService,
    @Inject(LoaderService) private readonly loaderService: LoaderService,
    @Inject(LoaderInPageService) private readonly loaderInPageService: LoaderInPageService,
  ) {
  }

  public getAll(): Observable<Carriage[]> {
    this.loaderService.show();
    const data$ = this.getAllEntity();

    return data$.pipe(
      map(data => {
        return this.carriageService.buildCarriagesEntity(data);
      }),
      tap(() => this.loaderService.hide()),
    );
  }

  public addCarriage(carriageValue: CarriageFormValue): Observable<string | null> {
    this.loaderInPageService.show();
    const stationRef = collection(this.db, 'carriages');

    return from(addDoc(stationRef, this.transformTypeCarriage(carriageValue))).pipe(
      switchMap((docRef) => {

        return from(updateDoc(docRef, { id: docRef.id })).pipe(
          map(() => docRef.id),
        );
      }),
      tap((id) => {
        this.alert.open('Станция успешно создана!').subscribe();
        this.loaderInPageService.hide();
        return of(id);
      }),
      catchError(err => {
        this.alert.open('Ошибка создания станции!', err).subscribe();
        this.loaderInPageService.hide();
        return of(null);
      }),
    );
  }

  public updateCarriage(id: string, carriageValue: CarriageFormValue): Observable<string | null> {
    this.loaderInPageService.show();

    const carriageRef = doc(this.db, 'carriages', id);

    return from(updateDoc(carriageRef, this.transformTypeCarriage(carriageValue))).pipe(
      map(() => {
        this.alert.open('Данные вагона обновлены!').subscribe();
        this.loaderInPageService.hide();
        return id;
      }),
      catchError(err => {
        this.alert.open('Ошибка обновления вагона!', {
          appearance: 'warning',
          data: err,
        }).subscribe();
        this.loaderInPageService.hide();
        return of(null);
      }),
    );
  }

  public delete(id: string): Observable<void> {
    this.loaderInPageService.show();
    const ref = doc(this.db, 'carriages', id);
    return fromPromise(deleteDoc(ref));
  }

  public getCarriageById(id: string): Observable<CarriageEntity | null> {
    this.loaderService.show();
    const ref = doc(this.db, 'carriages', id);
    return docData(ref, { idField: 'id' }).pipe(
      first(),
      map((station) => station as CarriageEntity),
      map((data) => (data ? data : null)),
      tap(() => this.loaderService.hide()),
    );
  }


  private transformTypeCarriage(carriageValue: CarriageFormValue): Omit<CarriageEntity, 'id'> {
    const { name, rows, leftSeats, rightSeats, backLeftSeats, backRightSeats } = carriageValue;
    return {
      rows: rows ?? 0,
      name: name ?? '',
      leftSeats: leftSeats ?? 0,
      rightSeats: rightSeats ?? 0,
      backRightSeats: backRightSeats ?? [],
      backLeftSeats: backLeftSeats ?? [],
    };
  }

  private getAllEntity(): Observable<CarriageEntity[]> {
    const queryId = query(
      collection(this.db, 'carriages'),
      orderBy('name', 'asc'),
    );
    return collectionData(queryId, { idField: 'id' }) as Observable<CarriageEntity[]>;
  }
}
