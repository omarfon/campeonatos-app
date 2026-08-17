import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppSessionService } from '../services/app-session.service';

export const appAuthGuard: CanActivateFn = () => {
  const sessionService = inject(AppSessionService);
  const router = inject(Router);

  if (sessionService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const appGuestGuard: CanActivateFn = () => {
  const sessionService = inject(AppSessionService);
  const router = inject(Router);

  if (!sessionService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/gestion/competencias']);
};
