import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { TuiButton, TuiIcon, TuiLoader, TuiTitle } from '@taiga-ui/core';
import { StationCardComponent } from '@components/station-card/station-card.component';
import { Station } from '@interfaces/station.interface';
import { LoaderService } from '@services/loader.service';
import { StationsFirestoreService } from '@services/firestore/stations.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stations-page',
  imports: [
    AsyncPipe,
    TuiLoader,
    StationCardComponent,
    TuiButton,
    TuiIcon,
    TuiTitle,
  ],
  templateUrl: './stations-page.component.html',
  styleUrl: './stations-page.component.less',
  standalone: true,
})
export class StationsPageComponent implements OnInit {
  public stations$: Observable<Station[]> | undefined;
  private stationsService = inject(StationsFirestoreService);
  private loaderService = inject(LoaderService);
  public loading$ = this.loaderService.loading$;
  private router = inject(Router);

  public ngOnInit(): void {
    this.stations$ = this.stationsService.getAll();
  }

  public handleClickButtons(stationId?: string): void {
    const route = stationId ? ['admin/station', stationId] : ['admin/station'];
    this.router.navigate(route);
  }
}
