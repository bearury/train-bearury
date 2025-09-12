import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dialog-create-ride',
  imports: [],
  templateUrl: './dialog-create-ride.component.html',
  styleUrl: './dialog-create-ride.component.less',
})
export class DialogCreateRideComponent {

  protected form = new FormGroup({
    exampleControl: new FormControl(''),
  });

}
