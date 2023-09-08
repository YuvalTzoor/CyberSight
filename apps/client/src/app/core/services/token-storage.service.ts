import { Injectable } from '@angular/core';
import { CookieOptions, CookieService } from 'ngx-cookie-service';

enum StorageCookieKey {
  ACCESS_TOKEN = 'accessToken',
  REFRESH_TOKEN = 'refreshToken',
  TOKEN_ID = 'tokenId',
}

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  constructor(private cookieService: CookieService) {}
  private cookieOptions: CookieOptions = {
    path: '/',
    secure: true,
    sameSite: 'Strict',
  };
  getAccessToken(): string {
    return this.cookieService.get(StorageCookieKey.ACCESS_TOKEN);
  }
  getRefreshToken(): string {
    return this.cookieService.get(StorageCookieKey.REFRESH_TOKEN);
  }
  getTokenId(): string {
    return this.cookieService.get(StorageCookieKey.TOKEN_ID);
  }
  private setCookie(key: StorageCookieKey, value: string) {
    this.cookieService.set(key, value, this.cookieOptions);
  }
  setTokens({ accessToken, refreshToken, tokenId }: { accessToken: string; refreshToken: string; tokenId: string }) {
    this.setCookie(StorageCookieKey.ACCESS_TOKEN, accessToken);
    this.setCookie(StorageCookieKey.REFRESH_TOKEN, refreshToken);
    this.setCookie(StorageCookieKey.TOKEN_ID, tokenId);
  }

  removeAllCookies() {
    const { path, secure, sameSite, domain } = this.cookieOptions;
    this.cookieService.deleteAll(path, domain, secure, sameSite);
  }
}
