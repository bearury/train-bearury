import { ChangeDetectionStrategy, Component, DestroyRef, Inject, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiAlertService, TuiButton, TuiDialogContext, TuiDialogService, TuiError, TuiIcon, TuiLabel, TuiLoader, TuiScrollable, TuiTextfieldComponent, TuiTextfieldDirective, TuiTitle } from '@taiga-ui/core';
import { TuiForm } from '@taiga-ui/layout';
import { TuiInputNumberModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { AngularYandexMapsModule } from 'angular8-yandex-maps';
import { Station } from '@interfaces/station.interface';
import { StationsFirestoreService } from '@services/firestore/stations.service';
import { StationForm } from '@interfaces/station-form.interface';
import { getDistanceFromLatLonInKm } from '../../shared/helpers/haversine-value';
import { LoaderService } from '@services/loader.service';
import { AsyncPipe } from '@angular/common';
import { TuiFieldErrorPipe, tuiValidationErrorsProvider } from '@taiga-ui/kit';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MapComponent } from '@components/map/map.component';
import { EmittedValueMap } from '@interfaces/emitted-value-map.interface';
import { MapService } from '@services/map.service';
import { uniqueValuesValidator } from '../../shared/helpers/unique-values.validator';
import { LoaderInPageService } from '@services/loader-in-page.service';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { tap } from 'rxjs';
import { STATION_TEMP_ID } from '../../shared/tokens/station-temp-id.token';


@Component({
  selector: 'app-station-manager-page',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AngularYandexMapsModule,
    AsyncPipe,
    MapComponent,
    TuiLabel,
    TuiTextfieldComponent,
    TuiTextfieldDirective,
    TuiForm,
    TuiInputNumberModule,
    TuiButton,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    TuiScrollable,
    TuiIcon,
    TuiTitle,
    TuiLoader,
    TuiError,
    TuiFieldErrorPipe,

  ],
  templateUrl: './station-manager-page.component.html',
  styleUrl: './station-manager-page.component.less',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    tuiValidationErrorsProvider({
      required: 'Поле должно быть заполнено',
      nonUnique: 'Поля должны быть уникальными',
    }),
  ],
})
export class StationManagerPageComponent implements OnInit {
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

  public stations = signal<Station[]>([]);
  public activeCurrentStation = signal<Station | null>(null);
  public processDeleteStation = signal<boolean>(false);
  private mapService = inject(MapService);
  private readonly alert = inject(TuiAlertService);
  private readonly dialogs = inject(TuiDialogService);
  private stationsFirestoreService = inject(StationsFirestoreService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private loaderService = inject(LoaderService);
  public loading$ = this.loaderService.loading$;
  private loaderInPageService = inject(LoaderInPageService);
  public loadingInPage$ = this.loaderInPageService.loading$;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    @Inject(STATION_TEMP_ID) private stationTempId: string,
  ) {
  }

  public ngOnInit(): void {
    const param = this.activatedRoute.snapshot.paramMap.get('stationId');
    this.stationId.set(param);

    if (param) {
      this.mapService.setViewMode();
    } else {
      this.mapService.setEditMode();
    }

    this.stationsFirestoreService.getAll().subscribe(stations => this.setInitData(stations, this.stationId()));

    this.form.controls.connectedTo.valueChanges.subscribe((value) => {
      const filteredArrayIsNullValueControls = value.filter(item => item !== null);
      this.mapService.addBalloons(filteredArrayIsNullValueControls);
    });

    this.form.valueChanges.subscribe(() => {
      if (this.form.controls.latitude.valid && this.form.controls.longitude.valid) {
        this.setMainBalloonFromEditField();
      } else {
        this.mapService.removeMainBalloon();
      }
    });
  }

  public onClickMap(event: EmittedValueMap): void {
    this.setStateCurrentValue(event.city, event.latitude, event.longitude);
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

      if (this.stations().findIndex(el => el.city === this.form.value.city) !== -1) {
        this.alert.open('Такая станция уже существует!', { appearance: 'error' }).subscribe();
      } else if (this.stationId()) {
        this.stationsFirestoreService.updateStationConnectedTo(this.stationId() as string, connectedTo)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe();
      } else {
        this.stationsFirestoreService.addStation({
          city,
          latitude,
          longitude,
          connectedTo,
        }).pipe(takeUntilDestroyed(this.destroyRef), tap(() => this.form.reset()))
          .subscribe();
      }
    } else {
      Object.keys(this.form.controls).forEach(key => {
        if (this.form.get(key)?.valid) {
          this.form.get(key)?.markAsUntouched();
        } else {
          this.form.get(key)?.markAsTouched();
        }
      });

      this.form.controls.connectedTo.controls.map(control => {
        control.markAsUntouched();
        if (control.valid) {
          control.markAsUntouched();
        } else {
          control.markAsTouched();
        }
      });
    }
  }

  public handleClickDelete(stationId: string | null, observer: PaymentResponse): void {
    this.processDeleteStation.set(true);
    if (stationId) {
      this.stationsFirestoreService.deleteStation(stationId).subscribe(() => {
        observer.complete();
        this.router.navigate(['/admin/stations']);
      });
    }
  }

  public getNameFromStation(station: Station): string {
    return station.city;
  }

  public handleAddConnectedTo(): void {
    const control = new FormControl(null, {
      validators: Validators.compose([Validators.required, uniqueValuesValidator()]),
    }) as FormControl<Station | null>;

    this.form.controls.connectedTo.push(control);
  }

  public handleRemoveConnectedTo(index: number): void {
    this.form.controls.connectedTo.removeAt(index);
  }

  protected showDialogDeleteButton(content: PolymorpheusContent<TuiDialogContext>): void {
    this.dialogs.open(content).subscribe();
  }

  private setMainBalloonFromEditField(): void {
    const { city, latitude, longitude } = this.form.value;
    const tempStation: Station = {
      id: this.stationTempId, city: city ?? '', latitude: +latitude!, longitude: +longitude!, connectedTo: [],
    };

    this.mapService.setMainBalloon(tempStation);
  }

  private setStateCurrentValue(city: string, latitude: number, longitude: number): void {
    const tempStation: Station = {
      id: this.stationTempId, city, latitude, longitude, connectedTo: [],
    };

    this.mapService.setMainBalloon(tempStation);

    this.form.controls.city.setValue(city);
    this.form.controls.latitude.setValue(latitude.toFixed(6));
    this.form.controls.longitude.setValue(longitude.toFixed(6));
  }

  private setInitData(stations: Station[], stationId: string | null): void {
    this.stations.set(stations);

    const currentStation: Station | null = stations.find(station => station.id === stationId) ?? null;

    if (stations.length && currentStation === null && this.stationId() !== null && !this.processDeleteStation()) {
      this.alert.open('Станция с таким ID не найдена!', { appearance: 'error' }).subscribe();
      this.stationId.set(null);
      this.router.navigate(['/admin/stations']);
    }

    this.activeCurrentStation.set(currentStation);
    this.form.controls.connectedTo.clear();

    if (currentStation) {
      this.setStateCurrentValue(currentStation.city, +currentStation.latitude, +currentStation.longitude);

      this.form.controls.city.disable();
      this.form.controls.latitude.disable();
      this.form.controls.longitude.disable();

      if (currentStation.connectedTo.length) {
        currentStation.connectedTo.forEach(connect => {
          const connectStation = stations.find(station => station.city === connect.name);
          if (connectStation) {
            this.form.controls.connectedTo.push(new FormControl(connectStation, {
              validators: Validators.compose([Validators.required, uniqueValuesValidator()]),
            }));
          }
        });
      }
    } else {
      this.mapService.clearBalloons();
    }
  }
}
