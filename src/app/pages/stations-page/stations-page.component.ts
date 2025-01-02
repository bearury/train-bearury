import { Component, inject } from '@angular/core';
import { TuiButton } from '@taiga-ui/core';
import { StationsFirestoreService } from '../../services/firestore/stations.service';

@Component({
  selector: 'app-stations-page',
  imports: [
    TuiButton,
  ],
  templateUrl: './stations-page.component.html',
  styleUrl: './stations-page.component.less',
})
export class StationsPageComponent {

  private stationsService = inject(StationsFirestoreService);


  public get(): void {
    this.stationsService.getAll().subscribe(data => console.log('⭐: ', data),
    );
  }
}
