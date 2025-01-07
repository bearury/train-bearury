import { inject, Injectable } from '@angular/core';
import { collection, collectionData, deleteDoc, doc, docData, Firestore, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { TuiAlertService } from '@taiga-ui/core';
import { forkJoin, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { LoaderService } from '../loader.service';
import { Station } from '@interfaces/station.interface';
import { StationEntity } from '@entitys/station.entity';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';


@Injectable({
  providedIn: 'root',
})
export class StationsFirestoreService {
  private readonly db = inject(Firestore);
  private readonly alert = inject(TuiAlertService);
  private readonly loaderService = inject(LoaderService);

  public getAll(): Observable<Station[]> {
    this.loaderService.show();
    const data$ = this.getAllEntity();

    return data$.pipe(
      map((stations) => {
        return stations.map((station) => {
          return {
            ...station,
            connectedTo: station.connectedTo.map((connected) => ({
              name: stations.find(st => st.id === connected.id)?.city ?? 'test',
              distance: connected.distance,
            })),
          };
        });
      }),
      tap(() => this.loaderService.hide()),
    ) as Observable<Station[]>;
  }

  public addStation(station: Omit<StationEntity, 'id'>): void {
    console.log('🐲: ', station);
  }

  public updateStationConnectedTo(stationId: string, connectedTo: { id: string, distance: number }[]): Observable<void[] | null> {
    return fromPromise(updateDoc(doc(this.db, 'stations', stationId), {
        connectedTo,
      }),
    ).pipe(
      switchMap(() => {
        return this.getStationById(stationId).pipe(
          switchMap(station => {
            if (station) {
              return this.updateConnectedAfterUpdatingCurrentStation(station, connectedTo);
            }
            return of(null);
          }),
        );
      }),
    );
  }

  public getStationById(stationId: string): Observable<StationEntity | null> {
    const userRef = doc(this.db, 'stations', stationId);
    return docData(userRef, { idField: 'id' }).pipe(
      map((station) => station as StationEntity),
      map((data) => (data ? data : null)),
    );
  }

  public deleteStation(stationId: string): Observable<void> {
    return from(deleteDoc(doc(this.db, 'stations', stationId)));
  }

  private getAllEntity(): Observable<StationEntity[]> {
    const queryId = query(
      collection(this.db, 'stations'),
      orderBy('city', 'asc'),
    );
    return collectionData(queryId, { idField: 'id' }) as Observable<StationEntity[]>;
  }

  //Данный метод реализует консистентность данных на беке ввиду ограниченных возможностей firestore
  private updateConnectedAfterUpdatingCurrentStation(currentStation: StationEntity, connectedTo: { id: string, distance: number }[]): Observable<void[] | null> {
    return this.getAllEntity().pipe(
      switchMap((stations) => {
        const updates = stations.map((station) => {
          const currentConnectedTo = station.connectedTo;
          const hasCurrentStation = currentConnectedTo.some(connect => connect.id === currentStation.id);
          const isConnectedToCurrentStation = connectedTo.some(connect => connect.id === station.id);

          if (station.id === currentStation.id) return null; // Если это текущая станция то, ничего не делаем и возвращаем null

          // Если текущая станция уже подключена
          if (hasCurrentStation) {
            // Если она не в аргументе connectedTo, нужно удалить
            if (!isConnectedToCurrentStation) {
              const updatedConnectedTo = currentConnectedTo.filter(connect => connect.id !== currentStation.id);
              return fromPromise(updateDoc(doc(this.db, 'stations', station.id), { connectedTo: updatedConnectedTo }));
            }
          } else {
            // Если текущая станция не подключена, добавляем её
            const distance = connectedTo.find(connect => connect.id === station.id)?.distance || 0;
            const updatedConnectedTo = [...currentConnectedTo, { id: currentStation.id, distance }];
            return fromPromise(updateDoc(doc(this.db, 'stations', station.id), { connectedTo: updatedConnectedTo }));
          }

          return null; // Нет изменений, возвращаем null
        }).filter(update => update !== null); // Убираем null из массива

        return updates.length > 0 ? forkJoin(updates) : of(null); // Выполняем все обновления
      }),
    );
  };
}

