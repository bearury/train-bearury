import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, inject, input, OnInit, Output, signal } from '@angular/core';
import { AngularYandexMapsModule, YaEvent, YaReadyEvent } from 'angular8-yandex-maps';
import { MapService } from '@services/map.service';
import { AsyncPipe } from '@angular/common';
import { EmittedValueMap } from '@interfaces/emitted-value-map.interface';
import { STATION_TEMP_ID } from '../../shared/tokens/station-temp-id.token';

@Component({
  selector: 'app-map',
  imports: [
    AngularYandexMapsModule,
    AsyncPipe,
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.less',
})
export class MapComponent implements OnInit, AfterViewInit {
  public initValueCoordinates = input.required<{ latitude: number, longitude: number }>();
  public isEditMode = signal<boolean>(false);
  public mapService = inject(MapService);
  public balloons$ = this.mapService.balloons$;

  @Output() private clickMap = new EventEmitter<EmittedValueMap>();
  private isEditMode$ = this.mapService.isEditMode$;
  private hostElement = inject(ElementRef);

  constructor(@Inject(STATION_TEMP_ID) public stationTempId: string) {
  }

  public ngAfterViewInit(): void {
    // Костыль для перерисовки карты при повторной инициализации
    this.hostElement.nativeElement.style.minHeight = '30vh';
    this.hostElement.nativeElement.style.flex = '1 1 20%';
  }

  public onReadyMap(eventMap: YaReadyEvent<ymaps.Map>): void {
    if (this.isEditMode()) {
      eventMap.target.cursors.push('crosshair');
    } else {
      eventMap.target.cursors.push('grab');
    }


    eventMap.target.controls.remove('mapTools')
      .remove('typeSelector')
      .remove('searchControl')
      .remove('trafficControl');
  }

  public async onClickMap(e: YaEvent<ymaps.Map>): Promise<void> {
    if (!this.isEditMode()) return;

    let nameCity = '';
    const coordinates = e.event.get('coords');


    // Название населенного пункта
    await e.ymaps.geocode(coordinates).then((res) => {
      const geo = res.geoObjects.toArray()[0];
      const data = geo.properties.get('metaDataProperty').GeocoderMetaData;

      const locality = data.Address.Components.find((add: { kind: string }) => add.kind === 'locality');

      if (locality) {
        const arrNameLocality = locality.name.split(' ');
        nameCity = arrNameLocality[arrNameLocality.length - 1];
      }
    });

    this.clickMap.emit({
      city: nameCity,
      latitude: +Number(coordinates[0]).toFixed(6),
      longitude: +Number(coordinates[1]).toFixed(6),
    });
  }

  public ngOnInit(): void {
    this.isEditMode$.subscribe(isEditMode => {
      this.isEditMode.set(isEditMode);
    });
  }
}
