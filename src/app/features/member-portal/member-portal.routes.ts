import { Routes } from '@angular/router';

const stub = (title: string) => ({
  loadComponent: () => import('./pages/stub/member-stub-page').then(m => m.MemberStubPageComponent),
  data: { title },
});

export const MEMBER_PORTAL_ROUTES: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  {
    path: 'inicio',
    loadComponent: () => import('./pages/dashboard/member-dashboard').then(m => m.MemberDashboardComponent),
  },
  {
    path: 'cuenta',
    redirectTo: 'perfil',
    pathMatch: 'full',
  },
  {
    path: 'familia',
    loadComponent: () => import('./pages/family/member-family').then(m => m.MemberFamilyPageComponent),
  },
  {
    path: 'familia/:personId',
    redirectTo: 'familia',
    pathMatch: 'full',
  },
  { path: 'actividades', loadComponent: () => import('./pages/activities/member-activities').then(m => m.MemberActivitiesPageComponent) },
  { path: 'actividades/inscribir', loadComponent: () => import('./pages/activities/member-enrollment-wizard').then(m => m.MemberEnrollmentWizardPageComponent) },
  { path: 'actividades/:id', loadComponent: () => import('./pages/activities/member-activity-detail').then(m => m.MemberActivityDetailPageComponent) },
  { path: 'mis-actividades', loadComponent: () => import('./pages/activities/member-my-activities').then(m => m.MemberMyActivitiesPageComponent) },
  { path: 'calendario', loadComponent: () => import('./pages/calendar/member-calendar').then(m => m.MemberCalendarPageComponent) },
  { path: 'eventos', ...stub('Eventos') },
  { path: 'eventos/:id', ...stub('Detalle del evento') },
  { path: 'mis-eventos', ...stub('Mis Eventos') },
  { path: 'entradas', ...stub('Mis Entradas') },
  { path: 'entradas/:id', ...stub('Detalle de entrada') },
  { path: 'beneficios', loadComponent: () => import('./pages/benefits/member-benefits').then(m => m.MemberBenefitsPageComponent) },
  { path: 'estado-cuenta', redirectTo: 'pagos', pathMatch: 'full' },
  { path: 'pagos', loadComponent: () => import('./pages/payments/member-payments').then(m => m.MemberPaymentsPageComponent) },
  { path: 'pagos/:id', loadComponent: () => import('./pages/payments/member-payment-detail').then(m => m.MemberPaymentDetailPageComponent) },
  { path: 'comprobantes', redirectTo: 'pagos', pathMatch: 'full' },
  { path: 'documentos', loadComponent: () => import('./pages/documents/member-documents').then(m => m.MemberDocumentsPageComponent) },
  { path: 'notificaciones', loadComponent: () => import('./pages/notifications/member-notifications').then(m => m.MemberNotificationsPageComponent) },
  { path: 'perfil', loadComponent: () => import('./pages/profile/member-profile').then(m => m.MemberProfilePageComponent) },
];
