import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CarriageCellComponent } from '@components/carriage-cell/carriage-cell.component';
import { Carriage2 } from '@interfaces/carriage.interface';

@Component({
  selector: 'app-carriage',
  imports: [
    CarriageCellComponent,
  ],
  templateUrl: './carriage.component.html',
  styleUrl: './carriage.component.less',
})
export class CarriageComponent {
  public carriage = signal<Carriage2>({
    id: 'temp',
    name: 'Mock Carriage',
    matrixIndexSeats: [[1, 6, 11], [2, 7, 12], [3, 8, 13], [4, 9, 14], [5, 10, 15]],
    leftSeats: 2,
    rightSeats: 3,
    backLeftSeats: [2, 4],
    backRightSeats: [1, 2],
  });

  @Output() public carriageChange = new EventEmitter<Carriage2>();

  public onUpdate(carriage: Carriage2): void {
    this.carriageChange.emit(carriage);
  }
}
