import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpStatusCode,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '~app/auth/shared/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {
  constructor(
    public authService: AuthService,
    private readonly tokenStorageService: TokenStorageService,
    private jwtHelperService: JwtHelperService,
    private router: Router,
  ) {}

  private isRefreshing$ = new BehaviorSubject<boolean>(false);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const accessToken = this.tokenStorageService.getAccessToken();

    if (accessToken !== '') {
      const isExpired = this.jwtHelperService.isTokenExpired(accessToken);
      if (isExpired) {
        const refreshToken = this.tokenStorageService.getRefreshToken();
        if (refreshToken !== '') {
          request = this.addTokenToHeader(request, refreshToken);
        }
      } else {
        request = this.addTokenToHeader(request, accessToken);
      }
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized) {
          return this.handle401Error(request, next);
        } else {
          return throwError(() => error);
        }
      }),
    );
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler) {
    if (!this.isRefreshing$.getValue()) {
      this.isRefreshing$.next(true);
      const refreshToken = this.tokenStorageService.getRefreshToken();
      const accessToken = this.tokenStorageService.getAccessToken();
      const tokenId = this.tokenStorageService.getTokenId();

      if (refreshToken && accessToken && tokenId) {
        if (this.jwtHelperService.isTokenExpired(accessToken)) {
          return this.authService.refreshToken().pipe(
            switchMap((token) => {
              this.isRefreshing$.next(false);
              return next.handle(this.addTokenToHeader(request, token.accessToken));
            }),
            catchError((error) => {
              this.isRefreshing$.next(false);
              return throwError(() => error);
            }),
          );
        }
      }
      this.isRefreshing$.next(false);
      this.authService.logout();
      this.router.navigate(['/'], {
        queryParams: { returnUrl: this.router.url },
      });
      return throwError(() => new Error());
    }
    return this.isRefreshing$.pipe(
      filter((isRefreshing) => !isRefreshing),
      take(1),
      switchMap(() => {
        const accessToken = this.tokenStorageService.getAccessToken();
        return next.handle(this.addTokenToHeader(request, accessToken));
      }),
    );
  }
  private addTokenToHeader(request: HttpRequest<unknown>, token: string) {
    const refreshTokenId = this.tokenStorageService.getTokenId();
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Token-Id': refreshTokenId,
      },
    });
  }
}
