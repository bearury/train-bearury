import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { of, Subject, takeUntil } from 'rxjs';
import { TuiAppearance, TuiButton, TuiError, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiFieldErrorPipe, tuiValidationErrorsProvider } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { AuthFirestoreService } from '@services/firestore/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TuiTextfield, TuiError, TuiFieldErrorPipe, TuiIcon, TuiButton, RouterLink, RouterLinkActive, TuiAppearance, TuiCardLarge],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    tuiValidationErrorsProvider({
      required: 'Поле должно быть заполнено',
      email: 'Почтовый адрес не корректный',
      pattern:
        'Пароль должен быть не менее 8 символов, содержать как минимум одну заглавную букву, цифру и специальный символ',
      maxlength: ({ requiredLength }: { requiredLength: string }) =>
        `Не должно быть больше ${requiredLength} символов`,
      minlength: ({ requiredLength }: { requiredLength: string }) =>
        of(`Не должно быть меньше ${requiredLength} символов`),
    }),
  ],
})
export class AuthPageComponent implements OnInit, OnDestroy {
  public readonly image = 'owl.png';
  public readonly loading = signal<boolean>(false);
  public readonly isPasswordFieldTextType = signal<boolean>(true);
  public form = new FormGroup<{
    email: FormControl<string | null>;
    password: FormControl<string | null>;
    name?: FormControl<string | null>;
  }>(
    {
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(
          /^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/,
        ),
      ]),
    },
    { updateOn: 'change' },
  );
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly authService = inject(AuthFirestoreService);
  private readonly destroy$ = new Subject<void>();

  public isLoginRoute(): boolean {
    return this.location.path().includes('/signin');
  }

  public ngOnInit(): void {
    if (!this.isLoginRoute()) {
      const control = new FormControl('', [
        Validators.required,
        Validators.maxLength(20),
        Validators.minLength(3),
      ]);
      this.form.addControl('name', control);
    }
  }

  public onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    this.loading.set(true);

    if (this.isLoginRoute()) {
      this.authService
        .signIn(
          this.form.value.email as string,
          this.form.value.password as string,
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe((data) => {
          this.loading.set(false);
          if (data) {
            this.router.navigate(['/']);
          }
        });
    } else {
      this.authService
        .signUp(
          this.form.value.email as string,
          this.form.value.password as string,
          this.form.value.name as string,
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.loading.set(false);
          this.router.navigate(['/login']);
        });
    }
  }

  public togglePasswordFieldTextType(): void {
    this.isPasswordFieldTextType.update((value) => !value);
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
