import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { PredictionPayload } from '@final-project/shared';
import { distinctUntilChanged, map, merge, retry, shareReplay, throwError, timeout, timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PredictionService {
  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
  ) {}
  private readonly apiPredictionUrl = 'api/prediction';
  predictFace(fileToUpload: File) {
    const formData: FormData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);
    return this.http
      .post<PredictionPayload>(`${this.apiPredictionUrl}/predict-face`, formData)
      .pipe(timeout(9000), retry({ count: 3, delay: this.shouldRetry }));
  }
  shouldRetry(error: { statusCode?: number; message?: string }) {
    if (error?.statusCode === HttpStatusCode.BadRequest && error?.message === 'No face detected') {
      return throwError(() => error);
    }
    return timer(300);
  }
  getPredictionImage(imageId: number) {
    return this.http
      .get<Blob>(`${this.apiPredictionUrl}/image/${imageId}`, {
        responseType: 'blob' as 'json',
      })
      .pipe(
        map((e) => {
          return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(e));
        }),
        distinctUntilChanged(),
        shareReplay(1),
        timeout(5000),
        retry(3),
      );
  }
  deletePredictions(ids: number[]) {
    const deletedPredictions$ = ids.map((id) => this.deletePrediction(id));
    return merge(...deletedPredictions$);
  }
  deletePrediction(id: number) {
    return this.http.delete<PredictionPayload>(`${this.apiPredictionUrl}/${id}`).pipe(timeout(1500), retry(3));
  }
}
