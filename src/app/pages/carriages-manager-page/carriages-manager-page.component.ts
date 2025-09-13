import { Component, DestroyRef, Inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Carriage,
  CarriageEntity,
  CarriageFormData,
  CarriageFormValue,
} from '@interfaces/carriage.interface';
import { CarriageService } from '@services/carriage.service';
import { CarriageForm } from '@interfaces/carriage-form.interface';
import { CarriageComponent } from '@components/carriage/carriage.component';
import {
  TuiDataListDropdownManager,
  TuiFieldErrorPipe,
  TuiInputNumber,
  tuiValidationErrorsProvider,
} from '@taiga-ui/kit';
import {
  TuiAlertService,
  TuiButton,
  TuiError,
  TuiLabel,
  TuiLoader,
  TuiTextfieldComponent,
  TuiTextfieldDirective,
} from '@taiga-ui/core';
import {
  TuiInputNumberModule,
  TuiMultiSelectModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/legacy';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { CarriageFirestoreService } from '@services/firestore/carriage-firestore.service';
import { setErrorFormFieldError } from '../../shared/helpers/set-error-form-field';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoaderInPageService } from '@services/loader-in-page.service';
import { ActivatedRoute } from '@angular/router';
import { LoaderService } from '@services/loader.service';

@Component({
  selector: 'app-carriages-manager-page',
  imports: [
    ReactiveFormsModule,
    CarriageComponent,
    TuiLabel,
    TuiTextfieldComponent,
    TuiTextfieldDirective,
    TuiInputNumberModule,
    TuiInputNumber,
    TuiButton,
    TuiMultiSelectModule,
    TuiTextfieldControllerModule,
    AsyncPipe,
    TuiError,
    TuiFieldErrorPipe,
    TuiLoader,
    TuiDataListDropdownManager,
  ],
  templateUrl: './carriages-manager-page.component.html',
  styleUrl: './carriages-manager-page.component.less',
  standalone: true,
  providers: [
    tuiValidationErrorsProvider({
      required: 'Поле должно быть заполнено',
      max: ({ max }: { max: number }) => `Не должно быть больше ${max}`,
      min: ({ min }: { min: string }) => `Не должно быть меньше ${min}`,
    }),
  ],
})
export class CarriagesManagerPageComponent implements OnInit {
  public form = new FormGroup<CarriageForm>(
    {
      name: new FormControl('', [Validators.required]),
      rows: new FormControl(null, [
        Validators.required,
        Validators.min(1),
        Validators.max(15),
      ]),
      leftSeats: new FormControl(null, [
        Validators.required,
        Validators.min(1),
        Validators.max(5),
      ]),
      rightSeats: new FormControl(null, [
        Validators.required,
        Validators.min(1),
        Validators.max(5),
      ]),
      backLeftSeats: new FormControl(null),
      backRightSeats: new FormControl(null),
    },
    { updateOn: 'change' }
  );

  public stationId = signal<string>('');
  public currentCarriage$: Observable<Carriage | null>;
  public isUpdateMode$: Observable<boolean>;
  public loadingInPage$: Observable<boolean>;
  public loading$: Observable<boolean>;
  private isEndInitForm = signal<boolean>(false);

  constructor(
    @Inject(CarriageService) private readonly carriageService: CarriageService,
    @Inject(CarriageFirestoreService)
    private readonly carriageFirestoreService: CarriageFirestoreService,
    @Inject(DestroyRef) private readonly destroyRef: DestroyRef,
    @Inject(ActivatedRoute) private readonly activatedRoute: ActivatedRoute,
    @Inject(TuiAlertService) private readonly alert: TuiAlertService,
    @Inject(LoaderInPageService)
    private readonly loaderInPageService: LoaderInPageService,
    @Inject(LoaderService) private readonly loaderService: LoaderService
  ) {
    this.currentCarriage$ = carriageService.currentCarriage$;
    this.isUpdateMode$ = carriageService.isUpdateMode$;
    this.loadingInPage$ = this.loaderInPageService.loading$;
    this.loading$ = this.loaderService.loading$;
  }

  public ngOnInit(): void {
    const param = this.activatedRoute.snapshot.paramMap.get('carriageId');
    this.stationId.set(param ?? '');

    if (param) {
      this.carriageFirestoreService.getCarriageById(param).subscribe(data => {
        this.carriageService.setUpdateMode();
        if (data) {
          this.setInitFormData(data);
          this.isEndInitForm.set(true);
        }
      });
    } else {
      this.carriageService.resetCurrentCarriage();
      this.carriageService.setCreateMode();
    }

    this.form.valueChanges.subscribe(value => {
      if (this.isEndInitForm()) {
        this.alert
          .open('Для сохранения, необходимо нажать кнопку Обновить', {
            label: 'Внимание!!!',
            appearance: 'warning',
          })
          .subscribe();

        this.isEndInitForm.set(false);
      }

      const { rows, rightSeats, leftSeats } = this.form.controls;
      if (rows.valid && rightSeats.valid && leftSeats.valid) {
        const carriage: CarriageFormData = {
          name: value.name ?? '',
          rows: value.rows ?? null,
          backRightSeats: value.backRightSeats ?? [],
          backLeftSeats: value.backLeftSeats ?? [],
          leftSeats: +(value.leftSeats ?? 0),
          rightSeats: +(value.rightSeats ?? 0),
        };
        this.carriageService.updateCurrentCarriage(carriage);
      }
    });
  }

  public onSubmit(): void {
    if (this.form.valid) {
      this.isUpdateMode$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(isUpdateMode => {
          const {
            name,
            rows,
            rightSeats,
            leftSeats,
            backRightSeats,
            backLeftSeats,
          } = this.form.value;

          const carriage: CarriageFormValue = {
            name,
            rows,
            rightSeats,
            leftSeats,
            backLeftSeats,
            backRightSeats,
          };

          if (isUpdateMode) {
            this.carriageFirestoreService
              .updateCarriage(this.stationId(), carriage)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe();
          } else {
            this.carriageFirestoreService
              .addCarriage(carriage)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe();
          }
        });
    } else {
      setErrorFormFieldError(this.form);
    }
  }

  protected handleClickSeat(index: number): void {
    const numberOfSeatsInRow =
      (this.form.value.leftSeats ?? 0) + (this.form.value.rightSeats ?? 0);

    const remainderOfDivision = index % numberOfSeatsInRow;

    const possibleCurrentRow = Math.floor(index / numberOfSeatsInRow);

    const row = !remainderOfDivision
      ? possibleCurrentRow
      : possibleCurrentRow + 1;

    const isRightRow =
      numberOfSeatsInRow * row - (this.form.value.rightSeats ?? 0) < index;

    const control =
      this.form.controls[isRightRow ? 'backRightSeats' : 'backLeftSeats'];

    const indexRow = control.value?.indexOf(row);

    if (indexRow !== -1) {
      const newArrRows = control.value?.filter(r => r !== row) ?? [];
      control.setValue(newArrRows);
    } else {
      control.setValue([...control.value!, row]);
    }
  }

  private setInitFormData(carriage: CarriageEntity): void {
    this.form.setValue({
      name: carriage.name,
      rows: carriage.rows,
      leftSeats: carriage.leftSeats,
      rightSeats: carriage.rightSeats,
      backLeftSeats: carriage.backLeftSeats,
      backRightSeats: carriage.backRightSeats,
    });
  }
}
