import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PredictionPayload } from '@final-project/shared';
import { SnackbarService } from '~app/core/services/snackbar.service';
import { UserService } from '~app/users/shared/user.service';
import { PredictionWithImage } from '../shared/prediction.model';
import { PredictionService } from '../shared/prediction.service';
import { Subject, takeUntil } from 'rxjs';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MainHeadingComponent } from '~app/shared/headings/main-heading/main-heading.component';

@Component({
  selector: 'app-predictions-history',
  templateUrl: './predictions-history.component.html',
  styleUrls: ['./predictions-history.component.css'],
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    CommonModule,
    DatePipe,
    MatButtonModule,
    MatSortModule,
    MainHeadingComponent,
  ],
})
export class PredictionsHistoryComponent implements OnInit, AfterViewInit, OnDestroy {
  loadingFlag = true;
  buttonsDisabled = true;
  destroy$ = new Subject<void>();

  dataSource: MatTableDataSource<PredictionWithImage> = new MatTableDataSource();
  selection = new SelectionModel<PredictionWithImage>(true, []);

  displayedColumns: string[] = ['select', 'modelResults', 'fakePercentage', 'createdAt', 'image'];

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort?: MatSort;

  constructor(
    private predictionService: PredictionService,
    private userService: UserService,
    private snackBarService: SnackbarService,
  ) {}
  ngOnInit(): void {
    this.getUserPredictions();
  }
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator || null;
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  exportAsCSV(): void {
    let csv = 'Date_Created,Time_Created,Logistic_Regression,Neural_Network,SVM,Fake_Percentage\n';
    this.dataSource.data.forEach((row) => {
      csv +=
        [
          new Date(row.createdAt).toLocaleString(),
          row.logreg ? '1 (Fake)' : '0 (Real)',
          row.neural_net ? '1 (Fake)' : '0 (Real)',
          row.svclassifier ? '1 (Fake)' : '0 (Real)',
          row.fakePercentage,
        ].join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'table-data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  getUserPredictions(): void {
    this.userService
      .getPredictions()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: PredictionWithImage[]) => {
        data.forEach((prediction) => {
          if (prediction.imageId)
            prediction.image = this.predictionService
              .getPredictionImage(prediction.imageId)
              .pipe(takeUntil(this.destroy$));
          const results = [prediction.logreg, prediction.neural_net, prediction.svclassifier];
          const zeros = results.filter((result) => result).length;
          if (zeros > 0) {
            prediction.fakePercentage = Math.round((zeros / results.length) * 100 - zeros) + '% Fake';
          } else {
            prediction.fakePercentage = '3% Fake';
          }
        });
        this.dataSource = new MatTableDataSource<PredictionPayload>(data);
        this.dataSource.paginator = this.paginator || null;

        this.dataSource.sort = this.sort || null;
        this.dataSource.sortingDataAccessor = (item, property) => {
          switch (property) {
            case 'createdAt':
              return new Date(item.createdAt).getTime();
            case 'fakePercentage': {
              const percentage = item.fakePercentage?.substring(0, item.fakePercentage?.indexOf('%')).trim();
              return Number(percentage);
            }
            default:
              return item[property as keyof PredictionWithImage] as string;
          }
        };
        this.buttonsDisabled = false;
        this.loadingFlag = false;
      });
  }

  deleteSelectedRows(): void {
    if (this.selection.selected.length === 0) {
      this.snackBarService.open('No rows selected');
      return;
    }
    this.buttonsDisabled = true;
    const selectedIds = this.selection.selected.map((prediction) => {
      return prediction.id;
    });
    this.predictionService
      .deletePredictions(selectedIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (x: PredictionPayload) => {
          this.dataSource.data = this.dataSource.data.filter((prediction) => prediction.id !== x.id);
          this.selection.clear();
        },
        error: (error) => {
          this.snackBarService.open('Something went wrong. Please try again later.');
          this.buttonsDisabled = false;
        },
        complete: () => {
          this.snackBarService.open('Predictions deleted successfully');
          this.buttonsDisabled = false;
        },
      });
  }
}
