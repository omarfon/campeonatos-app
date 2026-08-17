import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MemberSessionService } from '../services/member-session.service';

export const memberAuthGuard: CanActivateFn = () => {
  const sessionService = inject(MemberSessionService);
  const router = inject(Router);
  sessionService.restoreSession();
  if (sessionService.isAuthenticated()) return true;
  return router.createUrlTree(['/socio/login']);
};

export const memberGuestGuard: CanActivateFn = () => {
  const sessionService = inject(MemberSessionService);
  const router = inject(Router);
  sessionService.restoreSession();
  if (!sessionService.isAuthenticated()) return true;
  return router.createUrlTree(['/socio/inicio']);
};
