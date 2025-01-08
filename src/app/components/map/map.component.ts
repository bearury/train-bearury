import { AfterViewInit, Component, ElementRef, EventEmitter, inject, input, OnInit, Output, signal } from '@angular/core';
import { AngularYandexMapsModule, YaEvent, YaReadyEvent } from 'angular8-yandex-maps';
import { MapService } from '@services/map.service';
import { AsyncPipe } from '@angular/common';
import { EmittedValueMap } from '@interfaces/emitted-value-map.interface';

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
  public initValueCoordinates = input<{ latitude: number, longitude: number }>({
    latitude: 55.755702,
    longitude: 37.617531,
  });
  public isEditMode = signal<boolean>(false);
  public mapService = inject(MapService);
  public balloons$ = this.mapService.balloons$;
  @Output() private clickMap = new EventEmitter<EmittedValueMap>();
  private isEditMode$ = this.mapService.isEditMode$;

  private hostElement = inject(ElementRef);

  public ngAfterViewInit(): void {
    // Костыль для перерерисовки карты при повторной отрисовке
    this.hostElement.nativeElement.style.height = '30vh';
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
