import { Component, EventEmitter, input, Output } from '@angular/core';

@Component({
  selector: 'app-carriage-cell',
  imports: [],
  templateUrl: './carriage-cell.component.html',
  styleUrl: './carriage-cell.component.less',
})
export class CarriageCellComponent {
  public readonly numberSeat = input.required<number>();
  public readonly backSeat = input<boolean>(false);
  public readonly isEditMode = input.required<boolean>();

  @Output() public handleClickEvent = new EventEmitter<number>();

  protected handleClick(): void {
    this.handleClickEvent.emit(this.numberSeat());
  }
}
