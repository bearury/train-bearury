import { inject, Injectable, signal } from '@angular/core';
import { collection, collectionData, doc, Firestore, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { TuiAlertService } from '@taiga-ui/core';
import { from, map, Observable, tap } from 'rxjs';
import { LoaderService } from '../loader.service';
import { Station } from '@interfaces/station.interface';
import { StationEntity } from '@entitys/station.entity';


@Injectable({
  providedIn: 'root',
})
export class StationsFirestoreService {
  public readonly stationsSignal = signal<Station[]>([]);
  private readonly db = inject(Firestore);
  private readonly alert = inject(TuiAlertService);
  private readonly loaderService = inject(LoaderService);

  public getAll(): Observable<Station[]> {
    this.loaderService.show();
    const queryId = query(
      collection(this.db, 'stations'),
      orderBy('city', 'asc'),
    );
    const data$ = collectionData(queryId, { idField: 'id' }) as Observable<StationEntity[]>;


    return data$.pipe(
      map((stations) => {
        console.log('[28] ✨: ', stations);
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
      tap(stations => this.stationsSignal.set(stations)),
      tap(() => this.loaderService.hide()),
    ) as Observable<Station[]>;
  }

  public addStation(station: Omit<Station, 'id'>): void {
    console.log('🐲: ', station);
  }

  public updateStationConnectedTo(station: StationEntity, connect: { id: string, distance: number }): void {
    from(updateDoc(doc(this.db, 'stations', station.id), {
        connectedTo: station.connectedTo.push(connect),
      }),
    );
  }
}

