import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiAlertService, TuiButton, TuiIcon, TuiLabel, TuiScrollable, TuiTextfieldComponent, TuiTextfieldDirective, TuiTitle } from '@taiga-ui/core';
import { TuiForm } from '@taiga-ui/layout';
import { TuiInputNumberModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { AngularYandexMapsModule, YaEvent, YaReadyEvent } from 'angular8-yandex-maps';
import { Station } from '@interfaces/station.interface';
import { StationsFirestoreService } from '@services/firestore/stations.service';
import { StationForm } from '@interfaces/station-form.interface';
import { getDistanceFromLatLonInKm } from '../../shared/helpers/haversine-value';


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
    },
    { updateOn: 'change' },
  );
  public balloons = signal<Station[]>([]);
  public stations = signal<Station[]>([]);
  private readonly alert = inject(TuiAlertService);
  private stationsFirestoreService = inject(StationsFirestoreService);
  private activeBalloon = signal<Station | null>(null);
  @ViewChild('map', { read: ElementRef }) private mapContainer: ElementRef | undefined;
  private activatedRoute = inject(ActivatedRoute);

  public ngOnInit(): void {
    this.stationId.set(this.activatedRoute.snapshot.paramMap.get('stationId'));

    if (this.stationsFirestoreService.stationsSignal().length) {
      this.stations.set(this.stationsFirestoreService.stationsSignal());
    } else {
      this.stationsFirestoreService.getAll().subscribe(stations => this.stations.set(stations));
    }

    this.form.controls.connectedTo.valueChanges.subscribe((value) => {
      this.balloons.update((prev) => {
        const inActive = prev.filter(station => station.id === '1');
        return [...inActive];
      });
      value.forEach((val) => {
        if (val !== null) {
          this.balloons.update((prev) => [...prev, val]);
        }
      });

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
      if (this.stations().findIndex(el => el.city === this.form.value.city) === 1) {
        this.alert.open('Такая станция уже существует!', { appearance: 'error' }).subscribe();
      } else {
        this.stationsFirestoreService.addStation({
          city: this.form.value.city!,
          latitude: +this.form.value.latitude!,
          longitude: +this.form.value.longitude!,
          connectedTo: this.form.value.connectedTo?.map(conn => ({
            name: conn?.city ?? '',
            distance: getDistanceFromLatLonInKm(+this.form.value.latitude!, +this.form.value.longitude!, conn?.latitude ?? 0, conn?.longitude ?? 0),
          })) ?? [],
        });
      }
    }
  }

  public getNameFromStation(station: Station): string {
    return station.city;
  }

  public onReady(e: YaReadyEvent<ymaps.Map>): void {
    e.target.cursors.push('crosshair');
  }

  public onClick(e: YaEvent<ymaps.Map>): void {
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
        this.setBalloonValue(tempNameCity, +coordinates[0], +coordinates[1]);
      }
    });

    this.setBalloonValue('', +coordinates[0], +coordinates[1]);
  }


  public handleAddConnectedTo(): void {
    this.form.controls.connectedTo.push(new FormControl(null, [Validators.required]));
  }

  public handleRemoveConnectedTo(index: number): void {
    this.form.controls.connectedTo.removeAt(index);
  }

  private setBalloonValue(city: string, latitude: number, longitude: number): void {
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
}
