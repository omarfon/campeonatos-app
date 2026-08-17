import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StudentSessionService } from '../services/student-session.service';

export const studentAuthGuard: CanActivateFn = () => {
  const sessionService = inject(StudentSessionService);
  const router = inject(Router);
  sessionService.restoreSession();
  if (sessionService.isAuthenticated()) return true;
  return router.createUrlTree(['/portal-alumno/login']);
};

export const studentGuestGuard: CanActivateFn = () => {
  const sessionService = inject(StudentSessionService);
  const router = inject(Router);
  sessionService.restoreSession();
  if (!sessionService.isAuthenticated()) return true;
  return router.createUrlTree(['/portal-alumno/inicio']);
};
