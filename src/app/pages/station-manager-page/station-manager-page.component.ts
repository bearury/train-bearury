import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiLabel, TuiTextfieldComponent, TuiTextfieldDirective } from '@taiga-ui/core';
import { TuiForm } from '@taiga-ui/layout';
import { TuiInputNumberModule } from '@taiga-ui/legacy';
import { AngularYandexMapsModule, YaEvent, YaReadyEvent } from 'angular8-yandex-maps';
import { BalloonMap } from '@interfaces/balloon-map.interface';


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
  ],
  templateUrl: './station-manager-page.component.html',
  styleUrl: './station-manager-page.component.less',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StationManagerPageComponent implements OnInit, AfterViewInit {
  public stationId = signal<string | null>(null);
  public form = new FormGroup<{
    city: FormControl<string | null>;
    latitude: FormControl<string | null>;
    longitude: FormControl<string | null>;
  }>(
    {
      city: new FormControl('', [Validators.required]),
      latitude: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d{2}(\.\d{6})?$/),
      ]),
      longitude: new FormControl('', [Validators.required]),
    },
    { updateOn: 'change' },
  );
  public latitudeMap = signal<number>(55.755702);
  public longitudeMap = signal<number>(55.755702);
  public balloons = signal<BalloonMap[]>([]);
  public coordinatesLine = computed(() => {
    return this.balloons().map(balloon => [balloon.latitude, balloon.longitude]);
  });
  private activeBalloon = signal<BalloonMap | null>(null);
  @ViewChild('map', { read: ElementRef }) private mapContainer: ElementRef | undefined;
  private activatedRoute = inject(ActivatedRoute);

  public ngOnInit(): void {
    this.stationId.set(this.activatedRoute.snapshot.paramMap.get('stationId'));
  }

  public ngAfterViewInit(): void {
    // Костыль для перерерисовки карты при повторной отрисовке
    if (this.mapContainer) {
      this.mapContainer.nativeElement.style.height = '30vh';
    }
  }

  public onReady(e: YaReadyEvent<ymaps.Map>): void {
    e.target.cursors.push('crosshair');
  }

  public onClick(e: YaEvent<ymaps.Map>): void {
    let tempNameCity = 'Не определен';
    const coordinates = e.event.get('coords');
    this.latitudeMap.set(coordinates[0]);
    this.longitudeMap.set(coordinates[1]);


    this.activeBalloon.set({
      id: '1',
      latitude: coordinates[0],
      longitude: coordinates[1],
      city: tempNameCity,
    });

    // Название населенного пункта
    e.ymaps.geocode(coordinates).then((res) => {
      const geo = res.geoObjects.toArray()[0];
      const data = geo.properties.get('metaDataProperty').GeocoderMetaData;

      const locality = data.Address.Components.find((add: { kind: string }) => add.kind === 'locality');

      if (locality) {
        const arrNameLocality = locality.name.split(' ');
        tempNameCity = arrNameLocality[arrNameLocality.length - 1];
        this.setBalloonValue(tempNameCity, coordinates[0], coordinates[1]);
      }
    });

    this.setBalloonValue('', coordinates[0], coordinates[1]);

    console.log('🍁: LINES', this.coordinatesLine());
  }

  public onBalloon(e: any): void {
    console.log('[81] 🚀: ', e);
  }

  private setBalloonValue(city: string, latitude: number, longitude: number): void {
    this.activeBalloon.set({
      id: '1',
      latitude,
      longitude,
      city,
    });
    this.balloons.set([this.activeBalloon()!]);

    this.form.controls.city.setValue(city);
    this.form.controls.latitude.setValue(latitude.toFixed(6));
    this.form.controls.longitude.setValue(longitude.toFixed(6));
  }
}
