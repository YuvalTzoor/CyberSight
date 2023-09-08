import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PredictionPayload, imageValidationConfig } from '@final-project/shared';
import { Subject, take, takeUntil } from 'rxjs';
import { ROUTES_CONFIG, RoutesConfig } from '~app/configs/routes.config';
import { FileDndDirective } from '~app/core/directives/file-dnd.directive';
import { SnackbarService } from '~app/core/services/snackbar.service';
import { CustomAnimatedButtonComponent } from '~app/shared/buttons/custom-animated-button/custom-animated-button.component';
import { CustomGlowingButtonComponent } from '~app/shared/buttons/custom-glowing-button/custom-glowing-button.component';
import { PredictionService } from '../shared/prediction.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MainHeadingComponent } from '~app/shared/headings/main-heading/main-heading.component';

@Component({
  selector: 'app-face-prediction',
  templateUrl: './face-prediction.component.html',
  styleUrls: ['./face-prediction.component.css'],
  standalone: true,
  animations: [
    trigger('expandCollapse', [
      state(
        'collapsed',
        style({
          height: '0px',
          opacity: '0',
        }),
      ),
      state(
        'expanded',
        style({
          height: '*',
          opacity: '1',
        }),
      ),
      transition('collapsed <=> expanded', animate('300ms ease-out')),
    ]),
  ],
  imports: [
    MatCardModule,
    MatSnackBarModule,
    FileDndDirective,
    CommonModule,
    CustomAnimatedButtonComponent,
    CustomGlowingButtonComponent,
    MatProgressBarModule,
    MainHeadingComponent,
  ],
})
export class FacePredictionComponent implements OnDestroy {
  fileToUpload?: File | null;
  previewImage?: ArrayBuffer | string | null;
  prediction?: PredictionPayload;
  fakePercentage = 0;
  uploadButtonDisabled = false;
  destroy$ = new Subject<void>();
  showTestImageButton = false;
  allowedTypes = imageValidationConfig.allowedTypes;

  constructor(
    private predictionService: PredictionService,
    @Inject(ROUTES_CONFIG) public routesConfig: RoutesConfig,
    private snackbarService: SnackbarService,
  ) {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  predict(): void {
    if (this.fileToUpload) {
      this.uploadButtonDisabled = true;
      this.showTestImageButton = false;
      this.fakePercentage = 0;
      this.predictionService
        .predictFace(this.fileToUpload)
        .pipe(take(1), takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            this.prediction = res;
            this.calculatePercentage();
            setTimeout(() => {
              this.uploadButtonDisabled = false;
            }, 200);
          },
          error: (error) => {
            if (error?.message === 'No face detected') {
              this.snackbarService.open('No face found in the image.');
            } else {
              this.snackbarService.open('Something went wrong. Please try again later.');
              this.showTestImageButton = true;
            }
            setTimeout(() => {
              this.uploadButtonDisabled = false;
            }, 200);
          },
        });
    }
  }

  selectFileFromInputElement(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      const files = event.target.files;
      files && this.selectFile(files);
    }
  }
  selectFile(files: FileList): void {
    this.cleanFile();
    this.fileToUpload = files?.item(0);

    if (this.fileToUpload && this.fileToUpload.type.match('image.*')) {
      if (this.fileToUpload.size > imageValidationConfig.maxSize) {
        this.snackbarService.open(
          `File size is too big. The size limit is ${imageValidationConfig.maxSize / 1024 ** 2}MB.`,
        );
        this.cleanFile();
      }
      const allowedTypes = Array.from(this.allowedTypes as readonly string[]);
      if (!allowedTypes.includes(this.fileToUpload.type)) {
        this.snackbarService.open(
          `The format of ${
            this.fileToUpload.name
          } is not supported. Only ${imageValidationConfig.allowedExtensions.join(', ')} are supported.`,
        );
        this.cleanFile();
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.previewImage = e.target?.result;
        this.showTestImageButton = true;
      };
      reader.readAsDataURL(this.fileToUpload!);
    }
  }

  cleanFile(): void {
    this.fileToUpload = null;
    this.previewImage = null;
    this.prediction = undefined;
    this.fakePercentage = 0;
    this.destroy$.next();
    this.uploadButtonDisabled = false;
  }

  calculatePercentage(): number {
    if (this.prediction) {
      const results = [this.prediction.logreg, this.prediction.svclassifier, this.prediction.neural_net];
      const zeros = results.filter((result) => result).length;

      if (zeros > 0) {
        const fakePercentage = Math.round(
          (zeros / results.length) * 100 - zeros, // -zeros because there is always a chance that there was an error in the prediction
        );

        setTimeout(() => {
          this.fakePercentage = fakePercentage;
        }, 100);
        return fakePercentage;
      } else {
        setTimeout(() => {
          this.fakePercentage = 3;
        }, 100);
        return 3;
      }
    }
    return 0;
  }
}
