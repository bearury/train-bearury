import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Carriage2, CarriageFormData, CarriageVM } from '@interfaces/carriage.interface';
import { CarriageService } from '@services/carriage.service';
import { CarriageForm } from '@interfaces/carriage-form.interface';
import { CarriageComponent } from '@components/carriage/carriage.component';
import { TuiInputNumber } from '@taiga-ui/kit';
import { TuiButton, TuiLabel, TuiTextfieldComponent, TuiTextfieldDirective } from '@taiga-ui/core';
import { TuiInputNumberModule, TuiMultiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

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


  ],
  templateUrl: './carriages-manager-page.component.html',
  styleUrl: './carriages-manager-page.component.less',
  standalone: true,
})
export class CarriagesManagerPageComponent implements OnInit {
  public form = new FormGroup<CarriageForm>({
      name: new FormControl('', [Validators.required]),
      rows: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(20)]),
      leftSeats: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(9)]),
      rightSeats: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(9)]),
      backLeftSeats: new FormControl(null),
      backRightSeats: new FormControl(null),
    }, { updateOn: 'change' },
  );
  // public currentCarriage = signal<Carriage2 | null>(null);

  public currentCarriage$: Observable<Carriage2 | null>;

  constructor(@Inject(CarriageService) private carriageService: CarriageService) {
    this.currentCarriage$ = carriageService.currentCarriage$;

    console.log('[51] 🐬: ', this.currentCarriage$.subscribe(t => console.log('[51] 🍄: ', t)));
  }

  public ngOnInit(): void {
    this.form.valueChanges.subscribe((value) => {
      const carriage: CarriageFormData = {
        name: value.name ?? '',
        rows: value.rows ?? null,
        backRightSeats: value.backRightSeats ?? [],
        backLeftSeats: value.backLeftSeats ?? [],
        leftSeats: +(value.leftSeats ?? 0),
        rightSeats: +(value.rightSeats ?? 0),
      };
      this.carriageService.updateCurrentCarriage(carriage);
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
