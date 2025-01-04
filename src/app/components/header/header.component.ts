import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiNavigation } from '@taiga-ui/layout';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TUI_DARK_MODE, TuiButton, TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'app-header',
  imports: [
    TuiNavigation,
    RouterLink,
    RouterLinkActive,
    TuiIcon,
    TuiButton,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class HeaderComponent {
  protected readonly darkMode = inject(TUI_DARK_MODE);
}
