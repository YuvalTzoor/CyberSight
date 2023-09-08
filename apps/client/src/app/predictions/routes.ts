import { Route } from '@angular/router';
import { authGuard } from '~app/auth/auth.guard';
import { RoutesConfig } from '~app/configs/routes.config';
import { FacePredictionComponent } from './face-prediction/face-prediction.component';
import { PredictionsHistoryComponent } from './predictions-history/predictions-history.component';

const predictionRoutes = RoutesConfig.routeNames.prediction;

export default [
  {
    path: predictionRoutes.facePrediction,
    component: FacePredictionComponent,
    canActivate: [authGuard],
  },
  {
    path: predictionRoutes.predictionsHistory,
    component: PredictionsHistoryComponent,
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: predictionRoutes.facePrediction,
    pathMatch: 'full',
  },
] as Route[];
