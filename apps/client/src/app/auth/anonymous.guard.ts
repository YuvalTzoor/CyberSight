import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { RoutesConfig } from '~app/configs/routes.config';
import { AuthService } from './shared/auth.service';

// This guard is used to prevent authenticated users from accessing pages intended only for anonymous users (e.g. login, registration, etc.).
export const AnonymousGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    map((x) => {
      if (!x) {
        return true;
      }
      // If the user is authenticated, redirect them to the face prediction page.
      router.navigate([RoutesConfig.routes.prediction.facePrediction]);
      return false;
    }),
    catchError(() => {
      authService.logout();
      router.navigate([RoutesConfig.routes.home]);
      return of(false);
    }),
  );
};
