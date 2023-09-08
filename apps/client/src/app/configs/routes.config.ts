import { InjectionToken } from '@angular/core';

export const ROUTES_CONFIG = new InjectionToken('routes.config');

const basePaths = {
  prediction: 'prediction',
  auth: 'auth',
  user: 'user',
};

const routeNames = {
  home: '',
  about: 'about',
  notFound: '404',
  prediction: {
    facePrediction: 'predict-face',
    predictionsHistory: 'history',
  },
  auth: {
    register: 'register',
    login: 'login',
  },
  user: {
    profile: 'profile',
  },
};

export const RoutesConfig = {
  basePaths,
  routeNames: routeNames,
  routes: {
    home: `/${routeNames.home}`,
    about: `/${routeNames.about}`,
    notFound: `/${routeNames.notFound}`,
    prediction: {
      facePrediction: `/${basePaths.prediction}/${routeNames.prediction.facePrediction}`,
      predictionsHistory: `/${basePaths.prediction}/${routeNames.prediction.predictionsHistory}`,
    },
    auth: {
      register: `/${basePaths.auth}/${routeNames.auth.register}`,
      login: `/${basePaths.auth}/${routeNames.auth.login}`,
    },
    user: {
      profile: `/${basePaths.user}/${routeNames.user.profile}`,
    },
  },
};
export interface RoutesConfig {
  basePaths: typeof basePaths;
  routeNames: typeof routeNames;
  routes: typeof RoutesConfig.routes;
}
