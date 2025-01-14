import { Component, input } from '@angular/core';
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
  // public carriage = signal<Carriage2>({
  //   id: 'temp',
  //   name: 'Mock Carriage',
  //   matrixIndexSeats: [[1, 6, 11], [2, 7, 12], [3, 8, 13], [4, 9, 14], [5, 10, 15]],
  //   leftSeats: 2,
  //   rightSeats: 3,
  //   backLeftSeats: [2, 4],
  //   backRightSeats: [1, 2],
  // });

  public carriage = input.required<Carriage2>();
}
