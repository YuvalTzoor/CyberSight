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
import { emailValidator, firstNameValidator, lastNameValidator, passwordValidator } from '../shared/validations.funcs';
import { CustomAnimatedButtonComponent } from '~app/shared/buttons/custom-animated-button/custom-animated-button.component';
import { Subject, takeUntil } from 'rxjs';
import { HttpStatusCode } from '@angular/common/http';
import { MainHeadingComponent } from '~app/shared/headings/main-heading/main-heading.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
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
export class RegisterComponent implements OnDestroy {
  registerForm = this.formBuilder.nonNullable.group({
    firstName: ['', [firstNameValidator]],
    lastName: ['', [lastNameValidator]],
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
  getError(formControl: FormControl): string {
    if (formControl.errors !== null) {
      const errors = Object.values(formControl.errors)[0];
      return errors;
    }
    return '';
  }
  sendForm() {
    if (this.registerForm.valid) {
      this.isButtonDisabled = true;
      const { firstName, lastName, email, password } = this.registerForm.getRawValue();

      this.authService
        .register(firstName, lastName, email, password)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackbarService.open('The user got created successfully! Please login.');
            setTimeout(() => {
              this.navigateToLogin();
            }, 800);
          },
          error: (error) => {
            if (error?.statusCode === HttpStatusCode.Conflict && error?.message) {
              this.registerForm.setErrors({ emailConflict: true });
              this.snackbarService.open(error.message);
            } else {
              this.snackbarService.open('Something went wrong. Please try again later.');
            }
            this.isButtonDisabled = false;
          },
        });
    }
  }
  navigateToLogin() {
    this.router.navigate([RoutesConfig.routes.auth.login]);
  }
}
