import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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
}
