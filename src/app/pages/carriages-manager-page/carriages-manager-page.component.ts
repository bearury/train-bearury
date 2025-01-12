import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Carriage, CarriageVM } from '@interfaces/carriage.interface';
import { CarriageService } from '@services/carriage.service';
import { CarriageForm } from '@interfaces/carriage-form.interface';
import { TuiCardMedium } from '@taiga-ui/layout';
import { CarriageComponent } from '@components/carriage/carriage.component';

@Component({
  selector: 'app-carriages-manager-page',
  imports: [
    ReactiveFormsModule,
    TuiCardMedium,
    CarriageComponent,
  ],
  templateUrl: './carriages-manager-page.component.html',
  styleUrl: './carriages-manager-page.component.less',
})
export class CarriagesManagerPageComponent implements OnInit {

  public showForm = false;
  public carriageVM = signal<CarriageVM | null>(null);
  public isUpdating = false;
  @ViewChild('formContainer') public formContainer!: ElementRef;

  public form = new FormGroup<CarriageForm>({
      name: new FormControl('', [Validators.required]),
      rows: new FormControl('', [Validators.required, Validators.min(1), Validators.max(20)]),
      leftSeats: new FormControl('', [Validators.required, Validators.min(1), Validators.max(5)]),
      rightSeats: new FormControl('', [Validators.required, Validators.min(1), Validators.max(5)]),
    }, { updateOn: 'change' },
  );
  protected readonly Array = Array;

  constructor(protected carriageService: CarriageService) {
  }

  public ngOnInit(): void {
    // this.carriageService.getCarriages();

    // this.form = this.fb.group({
    //   name: ['', Validators.required],
    //   rows: ['', [Validators.required, Validators.min(1), Validators.max(20)]],
    //   leftSeats: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
    //   rightSeats: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
    // });

    this.form.valueChanges.subscribe((value) => {
      if ((this.form.value.rows && +this.form.value.rows <= 20)
        && (this.form.value.leftSeats && +this.form.value.leftSeats <= 5)
        && (this.form.value.rightSeats && +this.form.value.rightSeats <= 5)) {
        const carriage: Carriage = {
          name: value.name ?? '',
          id: '1',
          rows: +(value.rows ?? 0),
          leftSeats: +(value.leftSeats ?? 0),
          rightSeats: +(value.rightSeats ?? 0),
        };
        this.carriageVM.set(this.carriageService.buildCarriageToVM(carriage));
      } else {
        this.carriageVM.set(null);
      }
    });
  }

  public onShowForm(): void {
    this.showForm = !this.showForm;
    this.form.reset();
    this.carriageVM.set(null);
    this.isUpdating = false;
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
    this.isUpdating = true;
    this.showForm = true;
    this.form.setValue({
      name: carriage.name,
      rows: carriage.columnsCount.toString(),
      leftSeats: carriage.leftSeats?.toString() ?? '',
      rightSeats: carriage.rightSeats?.toString() ?? '',
    });
    this.formContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }
}
