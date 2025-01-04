import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiLabel, TuiTextfieldComponent, TuiTextfieldDirective } from '@taiga-ui/core';
import { TuiForm } from '@taiga-ui/layout';
import { TuiInputNumberModule } from '@taiga-ui/legacy';
import { AngularYandexMapsModule, YaEvent, YaReadyEvent } from 'angular8-yandex-maps';


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
  ],
  templateUrl: './station-manager-page.component.html',
  styleUrl: './station-manager-page.component.less',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StationManagerPageComponent implements OnInit {
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

  public latitudeMap = signal<number>(0);
  public longitudeMap = signal<number>(0);
  private activatedRoute = inject(ActivatedRoute);

  public ngOnInit(): void {
    this.stationId.set(this.activatedRoute.snapshot.paramMap.get('stationId'));
  }

  public onReady(e: YaReadyEvent<ymaps.Map>): void {
    e.target.cursors.push('crosshair');
  }

  public onClick(e: YaEvent<ymaps.Map>): void {

    const coordinates = e.event.get('coords');

    this.latitudeMap.set(coordinates[0]);
    this.longitudeMap.set(coordinates[1]);


    e.ymaps.geocode(coordinates).then((res) => {

      const geo = res.geoObjects.toArray()[0];
      const data = geo.properties.get('metaDataProperty').GeocoderMetaData;


      const locality = data.Address.Components.find((add: { kind: string }) => add.kind === 'locality');


      console.log('🦜: ', locality);

    });

  }


}
