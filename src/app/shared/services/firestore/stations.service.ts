import { inject, Injectable } from '@angular/core';
import { collection, collectionData, Firestore, limit, orderBy, query } from '@angular/fire/firestore';
import { TuiAlertService } from '@taiga-ui/core';
import { map, Observable, tap } from 'rxjs';
import { LoaderService } from '../loader.service';
import { Station } from '@interfaces/station.interface';
import { StationEntity } from '@entitys/station.entity';


@Injectable({
  providedIn: 'root',
})
export class StationsFirestoreService {
  private readonly db = inject(Firestore);
  private readonly alert = inject(TuiAlertService);
  private readonly loaderService = inject(LoaderService);


  public getAll(): Observable<Station[]> {
    this.loaderService.show();
    const queryId = query(
      collection(this.db, 'stations'),
      orderBy('city', 'asc'),
      limit(2),
    );
    const data$ = collectionData(queryId, { idField: 'id' }) as Observable<StationEntity[]>;
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
}

