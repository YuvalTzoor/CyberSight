import { Route } from '@angular/router';
import { RoutesConfig } from '~app/configs/routes.config';
import { AnonymousGuard } from './anonymous.guard';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

const authRoutes = RoutesConfig.routeNames.auth;
export default [
  {
    path: authRoutes.register,
    component: RegisterComponent,
    canActivate: [AnonymousGuard],
  },
  {
    path: authRoutes.login,
    component: LoginComponent,
    canActivate: [AnonymousGuard],
  },
  {
    path: '',
    redirectTo: authRoutes.login,
    pathMatch: 'full',
  },
] as Route[];
