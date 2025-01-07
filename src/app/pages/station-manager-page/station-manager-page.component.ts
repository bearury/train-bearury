import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiAlertService, TuiButton, TuiError, TuiIcon, TuiLabel, TuiLoader, TuiScrollable, TuiTextfieldComponent, TuiTextfieldDirective, TuiTitle } from '@taiga-ui/core';
import { TuiForm } from '@taiga-ui/layout';
import { TuiInputNumberModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { AngularYandexMapsModule, YaEvent, YaReadyEvent } from 'angular8-yandex-maps';
import { Station } from '@interfaces/station.interface';
import { StationsFirestoreService } from '@services/firestore/stations.service';
import { StationForm } from '@interfaces/station-form.interface';
import { getDistanceFromLatLonInKm } from '../../shared/helpers/haversine-value';
import { LoaderService } from '@services/loader.service';
import { AsyncPipe } from '@angular/common';
import { TuiFieldErrorPipe } from '@taiga-ui/kit';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-station-manager-page',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TuiLabel,
    TuiTextfieldComponent,
    TuiTextfieldDirective,
    TuiForm,
    TuiInputNumberModule,
    AngularYandexMapsModule,
    TuiButton,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    TuiScrollable,
    TuiIcon,
    TuiTitle,
    AsyncPipe,
    TuiLoader,
    TuiError,
    TuiFieldErrorPipe,

  ],
  templateUrl: './station-manager-page.component.html',
  styleUrl: './station-manager-page.component.less',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StationManagerPageComponent implements OnInit, AfterViewInit {
  public stationId = signal<string | null>(null);
  public form = new FormGroup<StationForm>(
    {
      city: new FormControl('', [Validators.required]),
      latitude: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d{2}(\.\d{6})?$/),
      ]),
      longitude: new FormControl('', [Validators.required]),
      connectedTo: new FormArray<FormControl<Station | null>>([]),
    }, { updateOn: 'change' },
  );
  public balloons = signal<Station[]>([]);
  public stations = signal<Station[]>([]);
  public currentStation = signal<Station | null>(null);
  private readonly alert = inject(TuiAlertService);
  private stationsFirestoreService = inject(StationsFirestoreService);
  private activeBalloon = signal<Station | null>(null);
  @ViewChild('map', { read: ElementRef }) private mapContainer: ElementRef | undefined;
  private activatedRoute = inject(ActivatedRoute);

  private loaderService = inject(LoaderService);
  public loading$ = this.loaderService.loading$;
  private readonly destroyRef = inject(DestroyRef);

  public ngOnInit(): void {
    this.stationId.set(this.activatedRoute.snapshot.paramMap.get('stationId'));

    // if (this.stationsFirestoreService.stationsSignal().length) {
    //   this.setInitData(this.stationsFirestoreService.stationsSignal(), this.stationId());
    // } else {
    //   this.stationsFirestoreService.getAll().subscribe(stations => this.setInitData(stations, this.stationId()));
    // }


    this.stationsFirestoreService.getAll().subscribe(stations => this.setInitData(stations, this.stationId()));

    this.form.controls.connectedTo.valueChanges.subscribe((value) => {
      this.form.controls.connectedTo.controls.map(control => {
        if (this.form.controls.city.value === control.value?.city) {
          control.setErrors(['Название прилегающей станции совпадает с основной']);
        }
      });
      this.updateBalloons(value);
    });
  }

  public ngAfterViewInit(): void {
    // Костыль для перерерисовки карты при повторной отрисовке
    if (this.mapContainer) {
      this.mapContainer.nativeElement.style.height = '30vh';
    }
  }

  public onSubmit(): void {
    if (this.form.valid) {
      const city = this.form.controls.city.value as string;
      const latitude = Number(this.form.controls.latitude.value);
      const longitude = Number(this.form.controls.longitude.value);
      const connectedTo = this.form.value.connectedTo?.map(conn => ({
        id: conn?.id ?? '',
        distance: getDistanceFromLatLonInKm(latitude, longitude, conn?.latitude ?? 0, conn?.longitude ?? 0),
      })) ?? [];

      if (this.stations().findIndex(el => el.city === this.form.value.city) === 1) {
        this.alert.open('Такая станция уже существует!', { appearance: 'error' }).subscribe();
      } else if (this.stationId()) {

        this.stationsFirestoreService.updateStationConnectedTo(this.stationId() as string, connectedTo)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(t => console.log('🚨: ЬФТПУК', t),
          );
        // .pipe(takeUntilDestroyed(this.destroyRef))
        // .subscribe({
        //   complete: () => console.log('[115] 🚧: Complete'),
        // });
      } else {
        // this.stationsFirestoreService.addStation({
        //   city,
        //   latitude,
        //   longitude,
        //   connectedTo,
        // });
      }
    }
  }

  public getNameFromStation(station: Station): string {
    return station.city;
  }

  public onReady(e: YaReadyEvent<ymaps.Map>): void {
    if (!this.stationId()) {
      e.target.cursors.push('crosshair');
    }

    e.target.controls.remove('mapTools')
      .remove('typeSelector')
      .remove('searchControl')
      .remove('trafficControl');
  }

  public onClick(e: YaEvent<ymaps.Map>): void {
    if (this.currentStation()) return;

    let tempNameCity = 'Не определен';
    const coordinates = e.event.get('coords');

    //TODO надо с ID что-то придумать
    this.activeBalloon.set({
      id: '1',
      latitude: +coordinates[0],
      longitude: +coordinates[1],
      city: tempNameCity,
      connectedTo: [],
    });

    // Название населенного пункта
    e.ymaps.geocode(coordinates).then((res) => {
      const geo = res.geoObjects.toArray()[0];
      const data = geo.properties.get('metaDataProperty').GeocoderMetaData;

      const locality = data.Address.Components.find((add: { kind: string }) => add.kind === 'locality');

      if (locality) {
        const arrNameLocality = locality.name.split(' ');
        tempNameCity = arrNameLocality[arrNameLocality.length - 1];
        this.setStateCurrentValue(tempNameCity, +coordinates[0], +coordinates[1]);
      }
    });

    this.setStateCurrentValue('', +coordinates[0], +coordinates[1]);
  }


  public handleAddConnectedTo(): void {
    this.form.controls.connectedTo.push(new FormControl(null, [Validators.required]));
  }

  public handleRemoveConnectedTo(index: number): void {
    this.form.controls.connectedTo.removeAt(index);
  }

  private setStateCurrentValue(city: string, latitude: number, longitude: number): void {
    //TODO надо с ID что-то придумать
    this.activeBalloon.set({
      id: '1',
      latitude,
      longitude,
      city,
      connectedTo: [],
    });
    this.balloons.update((prev) => {
      const inActive = prev.filter(station => station.id !== '1');
      return [...inActive, this.activeBalloon()!];
    });


    this.form.controls.city.setValue(city);
    this.form.controls.latitude.setValue(latitude.toFixed(6));
    this.form.controls.longitude.setValue(longitude.toFixed(6));
  }

  private setInitData(stations: Station[], stationId: string | null): void {
    this.stations.set(stations);
    this.currentStation.set(stations.find(station => station.id === stationId) ?? null);

    this.form.controls.connectedTo.clear();


    if (this.currentStation() !== null) {
      this.setStateCurrentValue(this.currentStation()?.city ?? '', +(this.currentStation()?.latitude ?? 0), +(this.currentStation()?.longitude ?? 0));

      this.form.controls.city.disable();
      this.form.controls.latitude.disable();
      this.form.controls.longitude.disable();

      if (this.currentStation()?.connectedTo.length) {
        this.currentStation()?.connectedTo.forEach(connect => {
          const connectStation = stations.find(station => station.city === connect.name);
          if (connectStation) {
            this.updateBalloons([connectStation]);
            this.form.controls.connectedTo.push(new FormControl(connectStation, [Validators.required]));
          }
        });
      }
    }
  }

  private updateBalloons(stationData: (Station | null)[]): void {
    this.balloons.update((prev) => {
      const inActive = prev.filter(station => station.id === '1');
      return [...inActive];
    });
    stationData.forEach((val) => {
      if (val !== null) {
        this.balloons.update((prev) => [...prev, val]);
      }
    });
  }
}
