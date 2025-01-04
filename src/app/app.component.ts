import { TUI_DARK_MODE, TuiRoot } from '@taiga-ui/core';
import { Component, inject } from '@angular/core';
import { LayoutComponent } from '@components/layout/layout.component';

@Component({
  selector: 'app-root',
  imports: [TuiRoot, LayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
})
export class AppComponent {
  protected readonly darkMode = inject(TUI_DARK_MODE);
}
