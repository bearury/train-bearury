import { ChangeDetectionStrategy, Component, Inject, OnInit, signal } from '@angular/core';
import { TuiButton, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { AbstractControl, FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouteManagerForm } from '@interfaces/route-manager-form.interface';
import { StationEntity } from '@entitys/station.entity';
import { Carriage, CarriageEntity } from '@interfaces/carriage.interface';
import { Observable, Subscription } from 'rxjs';
import { TuiMultiSelectModule, TuiSelectModule } from '@taiga-ui/legacy';
import { TuiStringHandler } from '@taiga-ui/cdk';
import { Station } from '@interfaces/station.interface';
import { RouteFirestoreService } from '@services/firestore/route-firestore.service';
import { LoaderService } from '@services/loader.service';
import { AsyncPipe } from '@angular/common';
import { LoaderInPageService } from '@services/loader-in-page.service';

@Component({
  selector: 'app-route-manager-page',
  imports: [
    TuiIcon,
    FormsModule,
    ReactiveFormsModule,
    TuiButton,
    TuiLoader,
    TuiMultiSelectModule,
    TuiSelectModule,
    AsyncPipe,
  ],
  templateUrl: './route-manager-page.component.html',
  styleUrl: './route-manager-page.component.less',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteManagerPageComponent implements OnInit {
  public form = new FormGroup<RouteManagerForm>({
    stations: new FormArray<FormControl<Station | null>>([]),
    carriages: new FormArray<FormControl<Carriage | null>>([]),
  });

  public readonly stations = signal<Station[]>([]);
  public readonly carriages = signal<Carriage[]>([]);
  public loading$: Observable<boolean>;
  public loadingInPage$: Observable<boolean>;
  private subs: Subscription[] = [];

  constructor(
    @Inject(RouteFirestoreService) private readonly routesFirestoreService: RouteFirestoreService,
    @Inject(LoaderService) private readonly loaderService: LoaderService,
    @Inject(LoaderInPageService) private readonly loaderInPageService: LoaderInPageService,
  ) {

    this.routesFirestoreService.getStationAndCarriages().subscribe((arr) => {
      this.stations.set(arr[0]);
      this.carriages.set(arr[1]);
    });

    this.loading$ = this.loaderService.loading$;
    this.loadingInPage$ = this.loaderInPageService.loading$;
  }

  public ngOnInit(): void {
    this.form.controls.stations.push(new FormControl(null, [Validators.required]));
    this.form.controls.carriages.push(new FormControl(null, [Validators.required]));

    this.form.controls.stations.controls.forEach((_, index) => {
      this.subscribeToStationControlChanges(index);
    });
  }

  public onSubmit(): void {
    if (this.form.valid) {
      this.routesFirestoreService.addRoute(this.form.controls.stations.value, this.form.controls.carriages.value).subscribe();
    } else {
      this.form.controls.stations.controls.forEach((c) => {
        c.markAsTouched();
      });

      this.form.controls.carriages.controls.forEach((c) => {
        c.markAsTouched();
      });
    }
  }

  public getConnectedStationsSelect(index: number): Station[] {

    if (index > 0) {
      const prevControl = this.form.controls.stations.controls[index - 1];

      if (prevControl.value?.connectedTo.length) {
        const connectedStationsPrevControl = prevControl.value?.connectedTo.map(station => {
          return this.stations().find(st => st.city === station.name);
        });
        return connectedStationsPrevControl as Station[];
      } else {
        return [];
      }
    }

    return this.stations();
  }

  public handleAddControl(type: 'stations' | 'carriages'): void {
    const control = new FormControl(null, [Validators.required]);
    this.form.controls[type].push(control);

    if (type === 'stations') {
      const index = this.form.controls.stations.length - 1;
      this.subscribeToStationControlChanges(index);
    }
  }

  public handleRemoveControl(type: 'stations' | 'carriages', control: AbstractControl): void {
    const formArray = this.form.get(type) as FormArray;

    const index = formArray.controls.indexOf(control);

    if (index !== -1) {
      formArray.removeAt(index);

      const followControl = formArray.controls[index] as FormControl<Station | null>;
      const prevControl = formArray.controls[index - 1] as FormControl<Station | null>;

      if (prevControl && followControl) {
        const connectedStations = prevControl.value?.connectedTo || [];
        if (!connectedStations.some(station => station.name === followControl.value?.city)) {
          followControl.setValue(null);
        }
      }

      this.subs.forEach(sub => sub.unsubscribe());
      this.subs = [];

      this.form.controls.stations.controls.forEach((_, index) => {
        this.subscribeToStationControlChanges(index);
      });
    }
  }

  protected stringifyStation: TuiStringHandler<StationEntity> = (item) => item.city;
  protected stringifyCarriage: TuiStringHandler<CarriageEntity> = (item) => item.name;

  private subscribeToStationControlChanges(index: number): void {
    const stationControl = this.form.controls.stations.controls[index];

    this.subs.push(stationControl.valueChanges.subscribe(() => {
      this.removeFollowControl(stationControl, index);
    }));
  }

  private removeFollowControl(control: FormControl<Station | null>, index: number): void {
    const followControl = this.form.controls.stations.controls[index + 1];


    if (followControl) {
      const connectedStations = followControl.value?.connectedTo || [];
      if (!connectedStations.some(station => station.name === control.value?.city)) {
        followControl.setValue(null);
      }
    }
  }
}
