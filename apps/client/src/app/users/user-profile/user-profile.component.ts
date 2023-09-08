import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { EMPTY, Subject, forkJoin, map, mergeMap, takeUntil } from 'rxjs';
import {
  firstNameValidator,
  lastNameValidator,
  newPasswordValidator,
  passwordValidator,
} from '~app/auth/shared/validations.funcs';
import { ROUTES_CONFIG, RoutesConfig } from '~app/configs/routes.config';
import { SnackbarService } from '~app/core/services/snackbar.service';
import { CustomAnimatedButtonComponent } from '~app/shared/buttons/custom-animated-button/custom-animated-button.component';
import { ConfirmationDialogComponentComponent } from '~app/users/confirmation-dialog-component/confirmation-dialog-component.component';
import { PasswordDialogComponentComponent } from '~app/users/password-dialog-component/password-dialog-component.component';
import { UserService } from '../shared/user.service';
import { MainHeadingComponent } from '~app/shared/headings/main-heading/main-heading.component';
import { imageValidationConfig } from '@final-project/shared';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  standalone: true,
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { subscriptSizing: 'dynamic' },
    },
  ],
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          height: '*',
          opacity: 1,
        }),
      ),
      state(
        'closed',
        style({
          height: '0px',
          opacity: 0,
        }),
      ),
      transition('open <=> closed', [animate('0.4s')]),
    ]),
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatDialogModule,
    CustomAnimatedButtonComponent,
    MainHeadingComponent,
  ],
})
export class ProfileComponent implements OnInit, OnDestroy {
  userForm = this.fb.nonNullable.group({
    firstName: ['', [firstNameValidator]],
    lastName: ['', [lastNameValidator]],
    email: this.fb.nonNullable.control({ value: '', disabled: true }),
    changePassword: [false],
    password: [''],
    newPassword: [''],
    profileImage: [''],
  });
  fileToUpload?: File | null;
  profileImage?: SafeUrl | string | null;
  hidePassword = true;
  destroy$ = new Subject<void>();
  hasProfileImage = false;
  allowedTypes = imageValidationConfig.allowedTypes;

  constructor(
    @Inject(ROUTES_CONFIG) private routesConfig: RoutesConfig,
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.userService.currentUser$
      .pipe(
        takeUntil(this.destroy$),
        mergeMap((data) => {
          if (data) {
            this.userForm.patchValue({
              firstName: data?.firstName,
              lastName: data?.lastName,
              email: data?.email,
            });
            if (data?.profileImagePath) {
              this.hasProfileImage = true;
              return data.profileImage$?.pipe(map((x) => (this.profileImage = x))) || EMPTY;
            }
          }
          return EMPTY;
        }),
      )
      .subscribe();

    this.userForm.controls.changePassword.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((isChecked) => {
      this.userForm.controls.password.setValue('');
      this.userForm.controls.newPassword.setValue('');
      if (isChecked) {
        this.userForm.controls.password.setValidators([passwordValidator]);
        this.userForm.controls.newPassword.setValidators([newPasswordValidator]);
      } else {
        this.userForm.controls.password.removeValidators([passwordValidator]);
        this.userForm.controls.newPassword.removeValidators([newPasswordValidator]);
      }
      this.userForm.controls.password.updateValueAndValidity();
      this.userForm.controls.newPassword.updateValueAndValidity();
    });
  }

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

  update() {
    this.userForm.markAsUntouched(); // Prevent spamming the update button
    const { firstName, lastName, password, newPassword } = this.userForm.value;
    const update$ = this.userService
      .update({
        firstName,
        lastName,
        password,
        newPassword,
      })
      .pipe(takeUntil(this.destroy$));
    if (this.fileToUpload) {
      forkJoin([update$, this.userService.updateProfileImage(this.fileToUpload).pipe(takeUntil(this.destroy$))])
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.updateSuccess(),
        });
    } else {
      update$.subscribe({
        next: () => this.updateSuccess(),
        error: (error) => {
          if (error.message) {
            this.userForm.setErrors({ someError: true });
            this.snackbarService.open(error.message);
          } else {
            this.snackbarService.open('Something went wrong. Please try again later.');
          }
        },
      });
    }
  }

  private updateSuccess() {
    this.router.navigate([this.routesConfig.routes.prediction.facePrediction]).then(() => {
      this.snackbarService.open('Profile updated successfully!');
    });
  }
  private selectFile(files: FileList): void {
    this.fileToUpload = files?.item(0);

    if (this.fileToUpload && this.fileToUpload.type.match('image.*')) {
      if (this.fileToUpload.size > imageValidationConfig.maxSize) {
        this.snackbarService.open(
          `File size is too big. The size limit is ${imageValidationConfig.maxSize / 1024 ** 2}MB.`,
        );
        this.fileToUpload = null;
        return;
      }
      const allowedTypes = Array.from(this.allowedTypes as readonly string[]);
      if (!allowedTypes.includes(this.fileToUpload.type)) {
        this.snackbarService.open(
          `The format of ${
            this.fileToUpload.name
          } is not supported. Only ${imageValidationConfig.allowedExtensions.join(', ')} are supported.`,
        );
        this.fileToUpload = null;
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.profileImage = e.target?.result;
      };
      reader.readAsDataURL(this.fileToUpload);
      this.userForm.controls.profileImage.markAsTouched();
    }
  }

  selectFileFromInputElement(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      const files = event.target.files;
      files && this.selectFile(files);
    }
  }

  deleteUser() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponentComponent, {
      data: {
        message: 'Are you sure you want to delete your own user? All your data will be lost!',
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((conf) => {
        if (conf) {
          const passDialogRef = this.dialog.open(PasswordDialogComponentComponent);

          passDialogRef
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((password) => {
              if (!password || password === '') {
                this.snackbarService.open('Password was not entered!');
                return;
              }
              this.userService
                .delete(password)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: () => {
                    this.snackbarService.open('User deleted successfully!');
                    this.router.navigate([this.routesConfig.routes.home]);
                  },
                  error: (error) => {
                    if (error.message) {
                      this.snackbarService.open(error.message);
                    } else {
                      this.snackbarService.open('Something went wrong. Please try again later.');
                    }
                  },
                });
            });
        } else {
          this.snackbarService.open('Delete canceled!');
        }
      });
  }
}
