import { inject, Injectable } from '@angular/core';
import { collection, collectionData, Firestore, limit, orderBy, query } from '@angular/fire/firestore';
import { TuiAlertService } from '@taiga-ui/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StationsFirestoreService {
  private readonly db = inject(Firestore);
  private readonly alert = inject(TuiAlertService);


  public getAll(): Observable<never> {
    const queryId = query(
      collection(this.db, 'stations'),
      orderBy('city', 'asc'),
      limit(2),
    );
    return collectionData(queryId, { idField: 'id' }) as Observable<never>;
  }
}

