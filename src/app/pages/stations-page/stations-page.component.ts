import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { TuiButton, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { StationCardComponent } from '@components/station-card/station-card.component';
import { Station } from '@interfaces/station.interface';
import { LoaderService } from '@services/loader.service';
import { StationsFirestoreService } from '@services/firestore/stations.service';

@Component({
  selector: 'app-stations-page',
  imports: [
    AsyncPipe,
    TuiLoader,
    StationCardComponent,
    TuiButton,
    TuiIcon,
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

  public ngOnInit(): void {
    this.stations$ = this.stationsService.getAll();
  }
}
