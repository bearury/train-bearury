import { Component, Inject, input } from '@angular/core';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-header-in-page',
  imports: [
    TuiIcon,
    TuiButton,
  ],
  templateUrl: './header-in-page.component.html',
  styleUrl: './header-in-page.component.less',
})
export class HeaderInPageComponent {
  public readonly title = input.required<string>();
  public readonly icon = input.required<string>();

  constructor(
    @Inject(Location) public readonly location: Location,
  ) {
  }
}
