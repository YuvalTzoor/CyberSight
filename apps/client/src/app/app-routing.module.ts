import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { RoutesConfig } from './configs/routes.config';

const routes: Routes = [
  {
    path: RoutesConfig.routeNames.home,
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: RoutesConfig.routeNames.about,
    loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: RoutesConfig.basePaths.auth,
    loadChildren: () => import('./auth/routes'),
  },
  {
    path: RoutesConfig.basePaths.user,
    loadChildren: () => import('./users/routes'),
  },
  {
    path: RoutesConfig.basePaths.prediction,
    loadChildren: () => import('./predictions/routes'),
  },
  {
    path: RoutesConfig.routeNames.notFound,
    loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
  {
    path: '**',
    redirectTo: RoutesConfig.routes.notFound,
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
