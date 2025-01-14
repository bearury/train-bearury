import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Carriage2, CarriageVM } from '@interfaces/carriage.interface';
import { CarriageService } from '@services/carriage.service';
import { CarriageForm } from '@interfaces/carriage-form.interface';
import { CarriageComponent } from '@components/carriage/carriage.component';
import { TuiInputNumber } from '@taiga-ui/kit';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiBreakpointService, TuiButton, TuiLabel, TuiTextfieldComponent, TuiTextfieldDirective } from '@taiga-ui/core';
import { map } from 'rxjs';
import { TuiInputNumberModule } from '@taiga-ui/legacy';

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
  ],
  templateUrl: './carriages-manager-page.component.html',
  styleUrl: './carriages-manager-page.component.less',
})
export class CarriagesManagerPageComponent implements OnInit {


  // public carriageVM = signal<CarriageVM | null>(null);


  public form = new FormGroup<CarriageForm>({
      name: new FormControl('', [Validators.required]),
      rows: new FormControl('', [Validators.required, Validators.min(1), Validators.max(20)]),
      leftSeats: new FormControl('', [Validators.required, Validators.min(1), Validators.max(9)]),
      rightSeats: new FormControl('', [Validators.required, Validators.min(1), Validators.max(9)]),
      backLeftSeats: new FormControl('', [Validators.required, Validators.min(1), Validators.max(9)]),
      backRightSeats: new FormControl('', [Validators.required, Validators.min(1), Validators.max(9)]),
    }, { updateOn: 'change' },
  );
  public currentCarriage = signal<Carriage2 | null>(null);
  protected readonly Array = Array;
  protected open = signal(false);
  protected readonly isMobile = toSignal(
    inject(TuiBreakpointService).pipe(map((size) => size === 'mobile')),
  );

  constructor(@Inject(CarriageService) private carriageService: CarriageService) {
    this.currentCarriage.set(this.carriageService.currentCarriage());
  }

  public ngOnInit(): void {

    this.form.valueChanges.subscribe((value) => {


      const { rows, leftSeats, rightSeats, backLeftSeats, backRightSeats } = this.form.controls;

      if (rows.valid || leftSeats.valid || rightSeats.valid || backLeftSeats.valid || backRightSeats.valid) {
        const carriage: Omit<Carriage2, 'matrixIndexSeats'> = {
          name: value.name ?? '',
          id: '1',
          backRightSeats: [],
          backLeftSeats: [],
          leftSeats: +(value.leftSeats ?? 0),
          rightSeats: +(value.rightSeats ?? 0),
        };
        this.carriageService.updateCurrentCarriage(carriage);
      }
    });
  }


  public onSave(): void {
    if (this.form.valid) {
      const existingCarriage = this.carriageService.carriagesFromResponseSignal().find(carriage =>
        carriage.name.trim().toLowerCase() === this.form.controls.name.value?.trim().toLowerCase(),
      );

      console.log('⭐: ', existingCarriage);


      // if (existingCarriage && !this.isUpdating) {
      //   this.snackBar.open(`A carriage with this name ${this.form.value.name} already exists!`, 'Close', {
      //     duration: 3000,
      //     horizontalPosition: 'center',
      //     verticalPosition: 'top',
      //   });
      //   return;
      // }

      // if (this.isUpdating) {
      //   this.http.put(`/api/carriage/${existingCarriage.code}`, dataFromForm, {
      //     headers: {
      //       Authorization: `Bearer ${this.auth.getToken()}`,
      //     },
      //   }).subscribe({
      //     next: () => {
      //       const updatedCarriages = this.carriageService.carriagesFromResponseSignal().map(carriage =>
      //         carriage.name === existingCarriage.name ? this.carriageService.buildCarriageToVM({ ...carriage, ...dataFromForm }) : carriage,
      //       );
      //       this.carriageService.carriagesFromResponseSignal.set(updatedCarriages);
      //       this.onShowForm();
      //     },
      //     error: (error) => console.error(error),
      //   });
      // } else {
      //
      //
      //   this.http
      //     .post<{ code: string }>('/api/carriage', dataFromForm, {
      //       headers: {
      //         Authorization: `Bearer ${this.auth.getToken()}`,
      //       },
      //     })
      //     .subscribe({
      //       next: (response) => {
      //         const carriageWithCode = { ...dataFromForm, code: response.code };
      //         const carriageWithVM = this.carriageService.buildCarriageToVM(carriageWithCode);
      //         const updatedCarriages = [{ ...carriageWithVM }, ...this.carriageService.carriagesFromResponseSignal()];
      //
      //         this.carriageService.carriagesFromResponseSignal.set(updatedCarriages);
      //         this.onShowForm();
      //       },
      //       error: (error) => console.error(error),
      //     });
      // }
    }
  }

  public onUpdate(carriage: CarriageVM): void {

    console.log('⭐: ', carriage);


    // this.form.setValue({
    //   name: carriage.name,
    //   rows: carriage.columnsCount.toString(),
    //   leftSeats: carriage.leftSeats?.toString() ?? '',
    //   rightSeats: carriage.rightSeats?.toString() ?? '',
    // });

  }
}
