import { Component, input } from '@angular/core';
import { TuiButton, TuiIcon, TuiSurface, TuiTitle } from '@taiga-ui/core';
import { Station } from '../../shared/interfaces/station.interface';

@Component({
  selector: 'app-station-card',
  imports: [
    TuiTitle,
    TuiIcon,
    TuiSurface,
    TuiButton,
  ],
  templateUrl: './station-card.component.html',
  standalone: true,
  styleUrl: './station-card.component.less',
})
export class StationCardComponent {
  public station = input.required<Station>();
}
