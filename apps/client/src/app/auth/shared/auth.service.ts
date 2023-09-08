import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserPayload, UserWithTokensDataPayload } from '@final-project/shared';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TokenStorageService } from '~app/core/services/token-storage.service';
import { UserService } from '~app/users/shared/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private tokenStorageService: TokenStorageService,
    private jwtHelperService: JwtHelperService,
    private http: HttpClient,
    private userService: UserService,
  ) {}
  private readonly authApiUrl = 'api/auth';
  public isAuthenticated$ = this.userService.currentUser$.pipe(map((user) => !!user));

  public isLoggedIn = () => !this.jwtHelperService.isTokenExpired(this.tokenStorageService.getRefreshToken());

  register(firstName: string, lastName: string, email: string, password: string) {
    return this.http.post<UserPayload>(`${this.authApiUrl}/register`, {
      firstName,
      lastName,
      email,
      password,
    });
  }

  login(email: string, password: string): Observable<UserWithTokensDataPayload> {
    return this.http
      .post<UserWithTokensDataPayload>(`${this.authApiUrl}/login`, {
        email,
        password,
      })
      .pipe(
        map((response) => {
          const { accessToken, refreshToken, tokenId } = response.tokensData;
          this.tokenStorageService.setTokens({
            accessToken,
            refreshToken,
            tokenId,
          });
          this.userService.setCurrentUser(response);
          return response;
        }),
      );
  }

  refreshToken(): Observable<{
    refreshToken: string;
    accessToken: string;
    tokenId: string;
  }> {
    return this.http
      .post<{ refreshToken: string; accessToken: string; tokenId: string }>(`${this.authApiUrl}/refresh-token`, {})
      .pipe(
        map((response) => {
          const { refreshToken, accessToken, tokenId } = response;
          this.tokenStorageService.setTokens({
            accessToken,
            refreshToken,
            tokenId,
          });

          return response;
        }),
      );
  }
  logout() {
    if (this.isLoggedIn()) {
      this.http.post<void>(`${this.authApiUrl}/logout`, {}).subscribe({
        next: () => this.userService.setCurrentUser(null),
        error: () => this.userService.setCurrentUser(null),
      });
    } else {
      this.userService.setCurrentUser(null);
    }
  }
}
