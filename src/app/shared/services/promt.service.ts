import { Injectable } from '@angular/core';
import { TUI_DIALOGS } from '@taiga-ui/core';
import { PromptComponent } from '@components/promt/prompt.component';
import { TuiPopoverService } from '@taiga-ui/cdk';
import { PromptOptions } from '@interfaces/prompt-options';

@Injectable({
  providedIn: 'root',
  useFactory: () =>
    new PromptService(TUI_DIALOGS, PromptComponent, {
      heading: 'Are you sure?',
      buttons: ['Yes', 'No'],
    }),
})
export class PromptService extends TuiPopoverService<PromptOptions, boolean> {
}
