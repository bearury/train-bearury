import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { Router } from '@angular/router';
import { RouteFirestoreService } from '@services/firestore/route-firestore.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Route } from '@interfaces/route.interface';
import { CardRouteComponent } from '@components/card-route/card-route.component';

@Component({
  selector: 'app-routes-page',
  imports: [
    TuiButton,
    TuiIcon,
    AsyncPipe,
    CardRouteComponent,
  ],
  templateUrl: './routes-page.component.html',
  styleUrl: './routes-page.component.less',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutesPageComponent {
  public routes$: Observable<Route[]>;

  constructor(
    @Inject(Router) private readonly router: Router,
    @Inject(RouteFirestoreService) private readonly routesFirestoreService: RouteFirestoreService,
  ) {

    this.routes$ = this.routesFirestoreService.getAll();
  }

  public handleClickButtons(): void {
    this.router.navigateByUrl('admin/route/create');
  }
}
