import { Component, Inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CarriageFirestoreService } from '@services/firestore/carriage-firestore.service';
import { TuiButton, TuiDialogContext, TuiDialogService, TuiIcon, TuiLoader, TuiTitle } from '@taiga-ui/core';
import { Observable, Observer } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { LoaderService } from '@services/loader.service';
import { CarriageComponent } from '@components/carriage/carriage.component';
import { Carriage } from '@interfaces/carriage.interface';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';

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
  public readonly loading$: Observable<boolean> | undefined;

  private readonly idOnDelete = signal<string | null>(null);

  constructor(
    @Inject(CarriageFirestoreService) private readonly carriageFirestoreService: CarriageFirestoreService,
    @Inject(LoaderService) private readonly loaderService: LoaderService,
    @Inject(TuiDialogService) private readonly dialog: TuiDialogService,
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

  public onDelete(observable: Observer<void>): void {
    if (this.idOnDelete()) {
      const id = this.idOnDelete() as string;
      this.carriageFirestoreService.delete(id).subscribe(() => {
        observable.complete();
      });
    }
  }

  protected showDialog({ temp, id }: { temp: PolymorpheusContent<TuiDialogContext>, id: string }): void {
    this.dialog.open(temp, {
      label: 'Внимание !!!',
    }).subscribe({
      complete: () => {
        this.idOnDelete.set(null);
      },
    });
    this.idOnDelete.set(id);
  }
}
