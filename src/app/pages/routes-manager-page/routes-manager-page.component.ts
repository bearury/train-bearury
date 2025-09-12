import { Component, Inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderInPageComponent } from '../../shared/components/header-in-page/header-in-page.component';
import { RouteFirestoreService } from '@services/firestore/route-firestore.service';
import { AsyncPipe } from '@angular/common';
import { LoaderService } from '@services/loader.service';
import { LoaderInPageService } from '@services/loader-in-page.service';
import { Observable } from 'rxjs';
import { TuiButton, tuiDialog, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { DialogCreateRideComponent } from '@components/dialog-create-ride/dialog-create-ride.component';

@Component({
  selector: 'app-routes-manager-page',
  imports: [
    HeaderInPageComponent,
    AsyncPipe,
    TuiLoader,
    TuiButton,
    TuiIcon,
  ],
  templateUrl: './routes-manager-page.component.html',
  styleUrl: './routes-manager-page.component.less',
})
export class RoutesManagerPageComponent implements OnInit {

  public readonly routesId = signal<string>('');
  public readonly nameRide = signal<string>('');
  public loading$: Observable<boolean>;
  public loadingInPage$: Observable<boolean>;
  private readonly dialog = tuiDialog(DialogCreateRideComponent, {
    dismissible: true,
    label: 'Создание рассписания',
  });

  constructor(
    @Inject(ActivatedRoute) private readonly activatedRoute: ActivatedRoute,
    @Inject(RouteFirestoreService) private readonly routesFirestoreService: RouteFirestoreService,
    @Inject(Router) private readonly router: Router,
    @Inject(LoaderService) private readonly loaderService: LoaderService,
    @Inject(LoaderInPageService) private readonly loaderInPageService: LoaderInPageService,
  ) {
    this.loading$ = this.loaderService.loading$;
    this.loadingInPage$ = this.loaderInPageService.loading$;
  }

  public ngOnInit(): void {
    const param = this.activatedRoute.snapshot.paramMap.get('routesId');
    this.routesId.set(param ?? '');

    if (param) {
      this.routesFirestoreService.getRouteById(param).subscribe(data => {
        if (data) {
          this.nameRide.set(data.name);
        } else {
          this.router.navigateByUrl('/admin/routes');
        }
      });
    }

    console.log('✅: ', this.routesId());

  }

  public handleClickCreate(): void {
    this.dialog().subscribe({
      next: (data) => {
        console.info(`Dialog emitted data = ${data}`);
      },
      complete: () => {
        console.info('Dialog closed');
      },
    });
  }
}
