import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiButton, TuiIcon, TuiLoader, TuiTitle } from '@taiga-ui/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiForm } from '@taiga-ui/layout';

@Component({
  selector: 'app-route-manager-page',
  imports: [
    TuiIcon,
    TuiTitle,
    FormsModule,
    TuiForm,
    ReactiveFormsModule,
    TuiButton,
    TuiLoader,
  ],
  templateUrl: './route-manager-page.component.html',
  styleUrl: './route-manager-page.component.less',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteManagerPageComponent {


  public form = new FormGroup<{ city: FormControl }>(
    {
      city: new FormControl('', [Validators.required]),
    });


  public onSubmit(): void {
    console.log('🦜: ', this.form.value);
  }
}
