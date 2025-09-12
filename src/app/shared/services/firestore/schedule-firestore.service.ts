import { Inject, Injectable } from '@angular/core';
import { RouteFirestoreService } from './route-firestore.service';

@Injectable({
  providedIn: 'root',
})
export class ScheduleFirestoreService {
  constructor(
    @Inject(RouteFirestoreService)
    private readonly routeFirestoreService: RouteFirestoreService
  ) {}
  public getAll(): void {
    this.routeFirestoreService.getAll().subscribe(t => console.log(t));
  }
}
