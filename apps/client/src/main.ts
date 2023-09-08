import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { APP_INITIALIZER, enableProdMode, importProvidersFrom, inject } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { JwtModule } from '@auth0/angular-jwt';
import { EMPTY, catchError } from 'rxjs';
import { TokenStorageService } from '~app/core/services/token-storage.service';
import { AppRoutingModule } from './app/app-routing.module';
import { AppComponent } from './app/app.component';
import { ROUTES_CONFIG, RoutesConfig } from './app/configs/routes.config';
import { HttpTokenInterceptor } from './app/core/interceptors/http.token.interceptor';
import { UserService } from './app/users/shared/user.service';
import { environment } from './environments/environment';
import { HttpErrorInterceptor as HttpErrorInterceptor } from '~app/core/interceptors/http.error.interceptor';

if (environment.production) {
  enableProdMode();
}
export function initAuth(tokenStorageService: TokenStorageService, userService: UserService) {
  const tokenCookie = tokenStorageService.getAccessToken() || null;
  const currentUser = userService.getCurrentUser();

  return () => {
    if (tokenCookie) {
      return currentUser.pipe(catchError(() => EMPTY));
    }
    return EMPTY;
  };
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      HttpClientModule,
      MatSnackBarModule,
      JwtModule.forRoot({
        config: {
          tokenGetter: (e): string | null => inject(TokenStorageService).getAccessToken() || null,
          authScheme: 'Bearer ',
          allowedDomains: ['localhost:3000', 'localhost:4200'],
          disallowedRoutes: ['http://localhost:4200/auth/login'],
        },
      }),
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      deps: [TokenStorageService, UserService, HttpClient],
      multi: true,
    },
    {
      provide: ROUTES_CONFIG,
      useValue: RoutesConfig,
    },

    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpTokenInterceptor,
      multi: true,
    },

    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
  ],
}).catch((error) => console.error(error));
