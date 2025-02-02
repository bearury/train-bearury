import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-routes-page',
  imports: [
    TuiButton,
    TuiIcon,
  ],
  templateUrl: './routes-page.component.html',
  styleUrl: './routes-page.component.less',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutesPageComponent {

  constructor(@Inject(Router) private readonly router: Router) {
  }

  public handleClickButtons(): void {
    this.router.navigateByUrl('admin/route/create');
  }
}
