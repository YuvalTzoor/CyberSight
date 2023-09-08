import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '~app/auth/shared/auth.service';
import { RoutesConfig } from '~app/configs/routes.config';

export const authGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    map((x) => {
      if (x) {
        return true;
      }
      authService.logout();
      router.navigate([RoutesConfig.routes.home]);
      return false;
    }),
    catchError(() => {
      authService.logout();
      router.navigate([RoutesConfig.routes.home]);
      return of(false);
    }),
  );
};
