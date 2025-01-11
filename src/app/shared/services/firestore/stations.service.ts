import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, getDoc, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { TuiAlertService } from '@taiga-ui/core';
import { catchError, combineLatest, forkJoin, from, map, merge, Observable, of, switchMap, tap } from 'rxjs';
import { LoaderService } from '../loader.service';
import { Station } from '@interfaces/station.interface';
import { StationEntity } from '@entitys/station.entity';
import { LoaderInPageService } from '@services/loader-in-page.service';


@Injectable({
  providedIn: 'root',
})
export class StationsFirestoreService {
  private readonly db = inject(Firestore);
  private readonly alert = inject(TuiAlertService);
  private readonly loaderService = inject(LoaderService);
  private readonly loaderInPageService = inject(LoaderInPageService);


  public getAll(): Observable<Station[]> {
    this.loaderService.show();
    const data$ = this.getAllEntity();

    return data$.pipe(
      map((stations) => {
        return stations.map((station) => {
          return {
            ...station,
            connectedTo: station.connectedTo.map((connected) => ({
              name: stations.find(st => st.id === connected.id)?.city ?? 'Ошибка!',
              distance: connected.distance,
            })),
          };
        });
      }),
      tap(() => this.loaderService.hide()),
    ) as Observable<Station[]>;
  }

  public addStation(station: Omit<StationEntity, 'id'>): Observable<string | null> {
    this.loaderInPageService.show();
    const stationRef = collection(this.db, 'stations');

    return from(addDoc(stationRef, station)).pipe(
      switchMap((docRef) => {

        const updateStation = from(updateDoc(docRef, { id: docRef.id }));
        const update = station.connectedTo.length
          ? this.updatedConnectedToAddStation(docRef.id, station.connectedTo)
          : of(null);
        return forkJoin([updateStation, update]).pipe(map(() => docRef.id));
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


  public updateStationConnectedTo(stationId: string, connectedTo: { id: string, distance: number }[]): Observable<string> {
    this.loaderInPageService.show();

    const stationRef = doc(this.db, 'stations', stationId);

    return from(getDoc(stationRef)).pipe(
      switchMap((docSnapshot) => {


        const existingData = docSnapshot.data() as StationEntity;
        const existingConnectedTo = existingData.connectedTo || [];

        const existingIds = new Set(existingConnectedTo.map(conn => conn.id));
        const newIds = new Set(connectedTo.map(conn => conn.id));

        const toRemove = existingConnectedTo.filter(conn => !newIds.has(conn.id));
        const toAdd = connectedTo.filter(conn => !existingIds.has(conn.id));

        const updates: Observable<void>[] = [];

        updates.push(from(updateDoc(stationRef, { connectedTo })));

        toRemove.forEach((connStation) => {
          const connStationRef = doc(this.db, 'stations', connStation.id);

          updates.push(from(getDoc(connStationRef)).pipe(
            switchMap((docSnapshot) => {
              if (docSnapshot.exists()) {
                const existingData = docSnapshot.data() as StationEntity;
                const updatedConnectedTo = existingData.connectedTo.filter(
                  conn => conn.id !== stationId,
                );
                return from(updateDoc(connStationRef, { connectedTo: updatedConnectedTo }));
              }
              return of();
            }),
          ));
        });

        toAdd.forEach((connStation) => {
          const connStationRef = doc(this.db, 'stations', connStation.id);
          updates.push(from(getDoc(connStationRef)).pipe(
            switchMap((docSnapshot) => {
              if (docSnapshot.exists()) {
                const existingData = docSnapshot.data() as StationEntity;

                const updatedConnectedTo = [...(existingData.connectedTo || []), { id: stationId, distance: connStation.distance }];

                return from(updateDoc(connStationRef, { connectedTo: updatedConnectedTo }));
              }
              return of();
            }),
          ));
        });

        return combineLatest(updates).pipe(map(() => stationRef.id));
      }),
    )
      .pipe(
        tap(() => {
          this.alert.open('Станция успешно обновлена!').subscribe();
          this.loaderInPageService.hide();
        }),
        catchError(err => {
          this.alert.open('Ошибка обновления станции!', err).subscribe();
          this.loaderInPageService.hide();
          return of('');
        }),
      );
  }

  public getStationById(stationId: string): Observable<StationEntity | null> {
    const stationsRef = doc(this.db, 'stations', stationId);
    return docData(stationsRef, { idField: 'id' }).pipe(
      map((station) => station as StationEntity),
      map((data) => (data ? data : null)),
    );
  }

  public deleteStation(stationId: string): Observable<null> {

    this.loaderInPageService.show();

    const connStationRef = doc(this.db, 'stations', stationId);


    return from(getDoc(connStationRef)).pipe(
      switchMap((docSnapshot) => {

        const del = deleteDoc(doc(this.db, 'stations', stationId));
        const existingData = docSnapshot.data() as StationEntity;
        return from(del).pipe(map(() => existingData));
      }),
      switchMap((docSnapshot) => {

        if (!docSnapshot.connectedTo.length) return of(null);

        const updates = docSnapshot.connectedTo.map(connStation => {
          const connStationRef = doc(this.db, 'stations', connStation.id);

          return from(getDoc(connStationRef)).pipe(
            switchMap((docSnapshot) => {


              if (docSnapshot.exists()) {
                const existingData = docSnapshot.data() as StationEntity;
                const existingConnectedTo = existingData.connectedTo || [];

                const connectedTo = existingConnectedTo.filter(connStation => connStation.id !== stationId);

                // Обновляем connectedTo добавлением ссылки на новую станцию
                return from(updateDoc(connStationRef, {
                  connectedTo,
                }));
              } else {
                // Обработка случая, когда станция не найдена
                this.alert.open(`Ошибка обновления данных станции с ID ${connStation.id} `);
                return of(null); // или выбросьте ошибку
              }
            }),
          );
        });

        return combineLatest(updates).pipe(map(() => null));

      }),
      tap(() => {
        this.alert.open('Станция удалена!').subscribe();
        this.loaderInPageService.hide();
        return of(null);
      }),
      catchError(() => {
        this.alert.open('Ошибка создания станции!', { appearance: 'warning' }).subscribe();
        this.loaderInPageService.hide();
        return of(null);
      }));
  }

  private updatedConnectedToAddStation(stationId: string, connectedTo: { id: string, distance: number }[]): Observable<(void | null)[]> {
    const updates = connectedTo.map(connStation => {
      const connStationRef = doc(this.db, 'stations', connStation.id);

      // Получим текущее состояние connectedTo для обновления
      return from(getDoc(connStationRef)).pipe(
        switchMap((docSnapshot) => {
          if (docSnapshot.exists()) {
            const existingData = docSnapshot.data() as StationEntity;
            const existingConnectedTo = existingData.connectedTo || [];

            // Обновляем connectedTo добавлением ссылки на новую станцию
            return from(updateDoc(connStationRef, {
              connectedTo: [...existingConnectedTo, { id: stationId, distance: connStation.distance }],
            }));
          } else {
            // Обработка случая, когда станция не найдена
            this.alert.open(`Ошибка обновления данных станции с ID ${connStation.id} `);
            return of(null); // или выбросьте ошибку
          }
        }),
      );
    });
    // Подождем окончания всех обновлений
    return merge(...updates).pipe(map(() => []));
  }

  private getAllEntity(): Observable<StationEntity[]> {
    const queryId = query(
      collection(this.db, 'stations'),
      orderBy('city', 'asc'),
    );
    return collectionData(queryId, { idField: 'id' }) as Observable<StationEntity[]>;
  }
}

