import { Component, computed, input } from '@angular/core';
import { CarriageCellComponent } from '@components/carriage-cell/carriage-cell.component';
import { Carriage2 } from '@interfaces/carriage.interface';
import { TuiTitle } from '@taiga-ui/core';

@Component({
  selector: 'app-carriage',
  imports: [
    CarriageCellComponent,
    TuiTitle,
  ],
  templateUrl: './carriage.component.html',
  styleUrl: './carriage.component.less',
})
export class CarriageComponent {
  public carriage = input.required<Carriage2>();

  public dividerIndex = computed(() => {
    const carriage = this.carriage();
    if (carriage.rightSeats) {
      return carriage.rightSeats - 1;
    } else {
      return 0;
    }
  });

  public backLeftSeats = computed(() => {
    const carriage = this.carriage();
    return carriage.backLeftSeats;
  });

  public backLRightSeats = computed(() => {
    const carriage = this.carriage();
    return carriage.backRightSeats;
  });


  public getBackSeats(rowIndex: number, elementIndex: number): boolean {
    return ((this.dividerIndex() < rowIndex) && this.backLeftSeats().some(el => el === elementIndex + 1)) ||
      ((this.dividerIndex() >= rowIndex) && this.backLRightSeats().some(el => el === elementIndex + 1));
  }
}
