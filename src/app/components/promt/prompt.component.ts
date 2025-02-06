import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiButton, TuiDialogCloseService } from '@taiga-ui/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TuiPopover } from '@taiga-ui/cdk';
import { PromptOptions } from '@interfaces/prompt-options';
import { injectContext, PolymorpheusOutlet } from '@taiga-ui/polymorpheus';

@Component({
  standalone: true,
  selector: 'app-prompt',
  imports: [
    TuiButton,
    PolymorpheusOutlet,
  ],
  templateUrl: './prompt.component.html',
  styleUrls: ['./prompt.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDialogCloseService],
})
export class PromptComponent {
  protected readonly context = injectContext<TuiPopover<PromptOptions, boolean>>();

  constructor() {
    inject(TuiDialogCloseService)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.context.$implicit.complete());
  }

  public onClick(response: boolean): void {
    this.context.completeWith(response);
  }
}
