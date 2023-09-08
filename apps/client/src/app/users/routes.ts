import { Route } from '@angular/router';
import { authGuard } from '~app/auth/auth.guard';
import { RoutesConfig } from '~app/configs/routes.config';
import { ProfileComponent } from './user-profile/user-profile.component';

const userRoutes = RoutesConfig.routeNames.user;
export default [
  {
    path: userRoutes.profile,
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: userRoutes.profile,
    pathMatch: 'full',
  },
] as Route[];
