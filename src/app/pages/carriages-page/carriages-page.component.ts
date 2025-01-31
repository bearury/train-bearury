import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CarriageFirestoreService } from '@services/firestore/carriage-firestore.service';
import { TuiButton, TuiIcon, TuiLoader, TuiTitle } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { LoaderService } from '@services/loader.service';
import { CarriageComponent } from '@components/carriage/carriage.component';
import { Carriage } from '@interfaces/carriage.interface';

@Component({
  selector: 'app-carriages-page',
  imports: [
    TuiButton,
    TuiIcon,
    AsyncPipe,
    TuiTitle,
    TuiLoader,
    CarriageComponent,
  ],
  templateUrl: './carriages-page.component.html',
  styleUrl: './carriages-page.component.less',
  standalone: true,
})
export class CarriagesPageComponent implements OnInit {
  public carriages$: Observable<Carriage[]> | undefined;
  public loading$: Observable<boolean> | undefined;

  constructor(
    @Inject(CarriageFirestoreService) private readonly carriageFirestoreService: CarriageFirestoreService,
    @Inject(LoaderService) private readonly loaderService: LoaderService,
    @Inject(Router) private readonly router: Router,
  ) {
    this.loading$ = this.loaderService.loading$;
  }

  public ngOnInit(): void {
    this.carriages$ = this.carriageFirestoreService.getAll();
  }

  public handleClickButtons(): void {
    this.router.navigateByUrl('admin/carriage/create');
  }

  public onUpdate(id: string): void {
    this.router.navigate(['admin/carriage/update', id]);
  }

  public onDelete(id: string): void {
    this.carriageFirestoreService.delete(id).subscribe();
  }
}
