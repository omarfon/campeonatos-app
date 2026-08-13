import { Routes } from '@angular/router';

export const EVENT_ROUTES: Routes = [
  { path: '', redirectTo: 'nuevo', pathMatch: 'full' },
  { path: 'listado', loadComponent: () => import('./pages/event-list/event-list').then(m => m.EventListComponent) },
  { path: 'nuevo', loadComponent: () => import('./pages/event-form/event-form').then(m => m.EventFormComponent) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/events-dashboard').then(m => m.EventsDashboardComponent) },
  { path: 'calendario', loadComponent: () => import('./pages/calendar/events-calendar').then(m => m.EventsCalendarComponent) },
  { path: 'inscripciones', loadComponent: () => import('./pages/registrations/event-registrations').then(m => m.EventRegistrationsComponent) },
  { path: 'entradas', loadComponent: () => import('./pages/tickets/event-tickets').then(m => m.EventTicketsComponent) },
  { path: 'control-entradas', loadComponent: () => import('./pages/ticket-control/ticket-control').then(m => m.TicketControlComponent) },
  { path: 'consumos', loadComponent: () => import('./pages/consumptions/event-consumptions').then(m => m.EventConsumptionsComponent) },
  { path: 'recaudaciones', loadComponent: () => import('./pages/fundraising/event-fundraising-list').then(m => m.EventFundraisingListComponent) },
  { path: 'recaudaciones/:id', loadComponent: () => import('./pages/fundraising/event-fundraising-detail').then(m => m.EventFundraisingDetailComponent) },
  { path: 'liquidaciones', loadComponent: () => import('./pages/settlement/event-settlement-list').then(m => m.EventSettlementListComponent) },
  { path: 'configuracion', loadComponent: () => import('./pages/config/events-config').then(m => m.EventsConfigComponent) },
  { path: 'config', redirectTo: 'configuracion', pathMatch: 'full' },
  { path: ':id/liquidacion', loadComponent: () => import('./pages/settlement/event-settlement').then(m => m.EventSettlementComponent) },
  { path: ':id/editar', loadComponent: () => import('./pages/event-form/event-form').then(m => m.EventFormComponent) },
  { path: ':id', loadComponent: () => import('./pages/event-detail/event-detail').then(m => m.EventDetailComponent) },
];

export const PORTAL_EVENT_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/portal/portal-events').then(m => m.PortalEventListComponent) },
  { path: ':id', loadComponent: () => import('./pages/portal/portal-events').then(m => m.PortalEventDetailComponent) },
  { path: ':id/inscribirme', loadComponent: () => import('./pages/portal/portal-events').then(m => m.PortalRegistrationComponent) },
];
