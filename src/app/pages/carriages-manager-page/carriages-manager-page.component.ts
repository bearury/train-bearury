import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Carriage2, CarriageFormData } from '@interfaces/carriage.interface';
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
  public currentCarriage$: Observable<Carriage2 | null>;

  constructor(@Inject(CarriageService) private carriageService: CarriageService) {
    this.currentCarriage$ = carriageService.currentCarriage$;
  }

  public ngOnInit(): void {

    this.form.valueChanges.subscribe((value) => {
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
      console.log('⭐: ', this.form.value);
    }
  }
}
