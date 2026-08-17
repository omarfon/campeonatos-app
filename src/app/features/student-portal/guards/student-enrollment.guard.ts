import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { StudentEnrollmentService } from '../services/student-enrollment.service';

export const studentEnrollmentGuard: CanActivateFn = () => {
  const enrollmentService = inject(StudentEnrollmentService);
  const router = inject(Router);
  return enrollmentService.getEnrollmentContext().pipe(
    map(ctx => ctx.canEnroll ? true : router.createUrlTree(['/portal-alumno/matricula'], {
      queryParams: { blocked: '1' },
    })),
  );
};
