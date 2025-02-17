import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from '@angular/core';
import { Route } from '@interfaces/route.interface';
import { TuiAppearance, TuiButton, TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiCardLarge } from '@taiga-ui/layout';

@Component({
  selector: 'app-card-route',
  imports: [
    TuiAppearance,
    TuiCardLarge,
    TuiTitle,
    TuiButton,
    TuiIcon,
  ],
  templateUrl: './card-route.component.html',
  styleUrl: './card-route.component.less',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardRouteComponent {
  public route = input.required<Route>();

  @Output()
  public handleDelete = new EventEmitter<string>();

  @Output()
  public handleUpdate = new EventEmitter<string>();

  @Output()
  public handlePreview = new EventEmitter<string>();


  public onPreview(id: string): void {
    this.handlePreview.emit(id);
  };

  public onDelete(id: string): void {
    this.handleDelete.emit(id);
  }

  public onUpdate(id: string): void {
    this.handleUpdate.emit(id);
  }
}
