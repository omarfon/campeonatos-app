import { Routes } from '@angular/router';
import { studentEnrollmentGuard } from './guards/student-enrollment.guard';

export const STUDENT_PORTAL_ROUTES: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  {
    path: 'inicio',
    loadComponent: () => import('./pages/dashboard/student-dashboard').then(m => m.StudentDashboardComponent),
  },
  {
    path: 'matricula',
    loadComponent: () => import('./pages/enrollment/student-enrollment-hub').then(m => m.StudentEnrollmentHubComponent),
  },
  {
    path: 'matricula/nueva',
    loadComponent: () => import('./pages/enrollment/student-enrollment-wizard').then(m => m.StudentEnrollmentWizardComponent),
    canActivate: [studentEnrollmentGuard],
  },
  {
    path: 'matriculas',
    loadComponent: () => import('./pages/enrollments/student-enrollments-list').then(m => m.StudentEnrollmentsListComponent),
  },
  {
    path: 'matriculas/:id',
    loadComponent: () => import('./pages/enrollments/student-enrollment-detail').then(m => m.StudentEnrollmentDetailComponent),
  },
  {
    path: 'cursos',
    loadComponent: () => import('./pages/courses/student-courses').then(m => m.StudentCoursesComponent),
  },
  {
    path: 'cursos/:id',
    loadComponent: () => import('./pages/courses/student-course-detail').then(m => m.StudentCourseDetailComponent),
  },
  {
    path: 'horarios',
    loadComponent: () => import('./pages/schedule/student-schedule').then(m => m.StudentScheduleComponent),
  },
  {
    path: 'asistencia',
    loadComponent: () => import('./pages/attendance/student-attendance').then(m => m.StudentAttendanceComponent),
  },
  {
    path: 'pagos',
    loadComponent: () => import('./pages/payments/student-payments').then(m => m.StudentPaymentsComponent),
  },
  {
    path: 'pagos/:id',
    loadComponent: () => import('./pages/payments/student-payment-detail').then(m => m.StudentPaymentDetailComponent),
  },
  {
    path: 'documentos',
    loadComponent: () => import('./pages/documents/student-documents').then(m => m.StudentDocumentsComponent),
  },
  {
    path: 'comunicados',
    loadComponent: () => import('./pages/comunicados/student-comunicados').then(m => m.StudentComunicadosComponent),
  },
  { path: 'notificaciones', redirectTo: 'comunicados', pathMatch: 'full' },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/profile/student-profile').then(m => m.StudentProfileComponent),
  },
];
