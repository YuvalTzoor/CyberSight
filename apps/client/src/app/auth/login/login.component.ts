import { CommonModule, UpperCasePipe } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RoutesConfig } from '~app/configs/routes.config';
import { SnackbarService } from '~app/core/services/snackbar.service';
import { AuthService } from '../shared/auth.service';
import { emailValidator, passwordValidator } from '../shared/validations.funcs';
import { CustomAnimatedButtonComponent } from '~app/shared/buttons/custom-animated-button/custom-animated-button.component';
import { Subject, takeUntil } from 'rxjs';
import { MainHeadingComponent } from '~app/shared/headings/main-heading/main-heading.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    UpperCasePipe,
    MatSnackBarModule,
    CustomAnimatedButtonComponent,
    MainHeadingComponent,
  ],
})
export class LoginComponent implements OnDestroy {
  loginForm = this.formBuilder.nonNullable.group({
    email: ['', [emailValidator]],
    password: ['', [passwordValidator]],
  });

  hidePassword = true;
  destroy$ = new Subject<void>();
  isButtonDisabled = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService,
  ) {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  navigateToRegister() {
    this.router.navigate([RoutesConfig.routes.auth.register]);
  }
  getError(formControl: FormControl): string {
    if (formControl.errors !== null) {
      const errors = Object.values(formControl.errors)[0];
      return errors;
    }
    return '';
  }

  sendForm() {
    if (this.loginForm.valid) {
      this.isButtonDisabled = true;
      const { email, password } = this.loginForm.value;
      if (email && password) {
        this.authService
          .login(email, password)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.router.navigate([RoutesConfig.routes.prediction.facePrediction]);
            },
            error: (error) => {
              if (error?.message === 'Bad credentials') {
                this.loginForm.setErrors({ badCredentials: true });
                this.snackbarService.open('Bad credentials');
              } else {
                this.snackbarService.open('Something went wrong. Please try again later.');
              }
              this.isButtonDisabled = false;
            },
          });
      }
    }
  }
}
