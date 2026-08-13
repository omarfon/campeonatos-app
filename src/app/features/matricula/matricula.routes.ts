import { Routes } from '@angular/router';

export const MATRICULA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/enrollment-list/enrollment-list').then(m => m.EnrollmentListComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/enrollment-dashboard').then(m => m.EnrollmentDashboardComponent),
  },
  {
    path: 'dashboard-visual',
    loadComponent: () => import('./dashboard-cursos').then(m => m.DashboardCursosComponent),
  },
  {
    path: 'nueva',
    loadComponent: () => import('./pages/enrollment-wizard/enrollment-wizard').then(m => m.EnrollmentWizardComponent),
  },
  {
    path: 'nueva-legacy',
    loadComponent: () => import('./matricula-module-form').then(m => m.MatriculaModuleFormComponent),
  },
  {
    path: 'estudiantes/nuevo',
    loadComponent: () => import('./pages/students/enrollment-student-form').then(m => m.EnrollmentStudentFormComponent),
  },
  {
    path: 'estudiantes/:id/editar',
    loadComponent: () => import('./pages/students/enrollment-student-form').then(m => m.EnrollmentStudentFormComponent),
  },
  {
    path: 'estudiantes/:id',
    loadComponent: () => import('./pages/students/enrollment-student-detail').then(m => m.EnrollmentStudentDetailComponent),
  },
  {
    path: 'estudiantes',
    loadComponent: () => import('./pages/students/enrollment-students').then(m => m.EnrollmentStudentsPageComponent),
  },
  {
    path: 'clases',
    loadComponent: () => import('./pages/available-classes/available-classes').then(m => m.AvailableClassesComponent),
  },
  {
    path: 'convenios/nuevo',
    loadComponent: () => import('./pages/agreements/enrollment-agreement-form').then(m => m.EnrollmentAgreementFormComponent),
  },
  {
    path: 'convenios/:id/editar',
    loadComponent: () => import('./pages/agreements/enrollment-agreement-form').then(m => m.EnrollmentAgreementFormComponent),
  },
  {
    path: 'convenios/:id',
    loadComponent: () => import('./pages/agreements/enrollment-agreement-detail').then(m => m.EnrollmentAgreementDetailComponent),
  },
  {
    path: 'convenios',
    loadComponent: () => import('./pages/agreements/enrollment-agreements').then(m => m.EnrollmentAgreementsPageComponent),
  },
  {
    path: 'reglas',
    loadComponent: () => import('./pages/rules/enrollment-rules').then(m => m.EnrollmentRulesPageComponent),
  },
  {
    path: 'pagos',
    loadComponent: () => import('./pages/payments/enrollment-payments').then(m => m.EnrollmentPaymentsPageComponent),
  },
  {
    path: 'historial',
    loadComponent: () => import('./pages/history/enrollment-history-list').then(m => m.EnrollmentHistoryListComponent),
  },
  {
    path: 'legacy/:id',
    loadComponent: () => import('./matricula-detail').then(m => m.MatriculaDetailComponent),
  },
  {
    path: 'legacy',
    loadComponent: () => import('./matricula-list').then(m => m.MatriculaListComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/enrollment-detail/enrollment-detail').then(m => m.EnrollmentDetailComponent),
  },
];
