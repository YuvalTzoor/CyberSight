import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import type { UserPayload } from '@final-project/shared';
import { BehaviorSubject, distinctUntilChanged, map, retry, shareReplay, tap, timeout } from 'rxjs';
import { TokenStorageService } from '~app/core/services/token-storage.service';
import { PredictionWithImage } from '~app/predictions/shared/prediction.model';
import { User } from './user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private http: HttpClient,
    private readonly tokenStorageService: TokenStorageService,
    private sanitizer: DomSanitizer,
  ) {}
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());
  private readonly apiUserUrl = 'api/user';

  update(user: Partial<User> & { password?: string; newPassword?: string }) {
    user?.password === '' && delete user.password;
    user?.newPassword === '' && delete user.newPassword;
    return this.http
      .put<UserPayload>(this.apiUserUrl, {
        ...user,
      })
      .pipe(
        tap((response) => {
          this.setCurrentUser(response);
        }),
      );
  }

  getCurrentUser() {
    return this.http.get<UserPayload>(this.apiUserUrl, {}).pipe(
      tap({
        next: (user) => {
          return this.setCurrentUser(user);
        },
        error: () => {
          return false;
        },
      }),
      shareReplay(1),
    );
  }

  public setCurrentUser(user: User | null) {
    if (user) {
      if (user.profileImagePath !== null) {
        user.profileImage$ = this.getProfileImage();
      }
      this.currentUserSubject.next(user);
    } else {
      this.tokenStorageService.removeAllCookies();
      this.currentUserSubject.next(null);
    }
  }
  getProfileImage() {
    return this.http
      .get<Blob>(`${this.apiUserUrl}/profile-image`, {
        responseType: 'blob' as 'json',
      })

      .pipe(
        map((e: Blob | MediaSource) => {
          return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(e));
        }),
        distinctUntilChanged(),
        shareReplay(1),
      );
  }
  updateProfileImage(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.put<UserPayload>(`${this.apiUserUrl}/profile-image`, formData).pipe(
      tap((response) => {
        this.setCurrentUser(response);
      }),
      timeout(5000),
      retry(3),
    );
  }
  delete(password: string) {
    return this.http.delete(this.apiUserUrl, { body: { password } }).pipe(
      tap(() => {
        this.setCurrentUser(null);
      }),
    );
  }

  getPredictions() {
    return this.http.get<PredictionWithImage[]>(`${this.apiUserUrl}/predictions`).pipe(timeout(4000), retry(3));
  }
}
