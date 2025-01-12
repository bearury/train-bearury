import { Component, input } from '@angular/core';

@Component({
  selector: 'app-carriage-cell',
  imports: [],
  templateUrl: './carriage-cell.component.html',
  styleUrl: './carriage-cell.component.less',
})
export class CarriageCellComponent {
  public numberSeat = input.required<number>();
  public backSeat = input<boolean>(false);
}
