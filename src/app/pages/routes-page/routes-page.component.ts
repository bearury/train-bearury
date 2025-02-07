import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TuiButton, TuiDialogContext, TuiDialogService, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { Router } from '@angular/router';
import { RouteFirestoreService } from '@services/firestore/route-firestore.service';
import { Observable, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Route } from '@interfaces/route.interface';
import { CardRouteComponent } from '@components/card-route/card-route.component';
import { PromptService } from '@services/promt.service';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { LoaderService } from '@services/loader.service';
import { MapComponent } from '@components/map/map.component';
import { MapService } from '@services/map.service';

@Component({
  selector: 'app-routes-page',
  imports: [
    TuiButton,
    TuiIcon,
    AsyncPipe,
    CardRouteComponent,
    TuiLoader,
    MapComponent,
  ],
  templateUrl: './routes-page.component.html',
  styleUrl: './routes-page.component.less',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutesPageComponent {
  public readonly routes$: Observable<Route[]>;
  public readonly loading$: Observable<boolean> | undefined;

  constructor(
    @Inject(Router) private readonly router: Router,
    @Inject(PromptService) private readonly promptService: PromptService,
    @Inject(MapService) private readonly mapService: MapService,
    @Inject(TuiDialogService) private readonly dialog: TuiDialogService,
    @Inject(RouteFirestoreService) private readonly routesFirestoreService: RouteFirestoreService,
    @Inject(LoaderService) private readonly loaderService: LoaderService,
  ) {
    this.loading$ = this.loaderService.loading$;
    this.routes$ = this.routesFirestoreService.getAll();
  }

  public handleCreateButtons(): void {
    this.router.navigateByUrl('admin/route/create');
  }

  public onUpdate(id: string): void {
    this.router.navigateByUrl('admin/route/update/' + id);
  }

  public onPreview(id: string, content: PolymorpheusContent<TuiDialogContext>): void {
    this.routes$.subscribe(routes => {
      const currentRoute = routes.find((route: Route) => route.id === id);
      if (currentRoute) {
        this.mapService.addBalloons(currentRoute.stations);
      }
    });
    this.dialog.open(content).subscribe();
  }

  public onDelete(
    id: string,
    content: PolymorpheusContent,
  ): void {
    this.promptService
      .open(content, {
        heading: 'Удалить маршрут?',
        buttons: ['Удалить', 'Отмена'],
      })
      .pipe(
        tap((response) => {
          if (response) {
            this.routesFirestoreService.delete(id);
          }
        }),
      )
      .subscribe();
  }
}
