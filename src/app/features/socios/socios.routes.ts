import { Routes } from '@angular/router';

export const SOCIO_ROUTES: Routes = [
  // Rutas primarias
  {
    path: '',
    loadComponent: () => import('./socio-list').then((m) => m.SocioListComponent),
  },
  {
    path: 'solicitudes',
    loadComponent: () => import('./solicitud-list').then((m) => m.SolicitudListComponent),
  },
  {
    path: 'postulantes',
    loadComponent: () => import('./postulante-list').then((m) => m.PostulanteListComponent),
  },
  {
    path: 'cuotas',
    loadComponent: () => import('./cuota-list').then((m) => m.CuotaListComponent),
  },
  // Rutas de panel (outlet)
  {
    path: 'nuevo',
    outlet: 'panel',
    loadComponent: () => import('./socio-form').then((m) => m.SocioFormComponent),
  },
  {
    path: ':id/detalle',
    outlet: 'panel',
    loadComponent: () => import('./socio-detail').then((m) => m.SocioDetailComponent),
  },
  {
    path: ':id/editar',
    outlet: 'panel',
    loadComponent: () => import('./socio-form').then((m) => m.SocioFormComponent),
  },
  {
    path: 'solicitud/nueva',
    outlet: 'panel',
    loadComponent: () => import('./solicitud-form').then((m) => m.SolicitudFormComponent),
  },
  {
    path: 'postulante/nuevo',
    outlet: 'panel',
    loadComponent: () => import('./postulante-form').then((m) => m.PostulanteFormComponent),
  },
  {
    path: 'postulante/:id/detalle',
    outlet: 'panel',
    loadComponent: () => import('./postulante-detalle').then((m) => m.PostulanteDetalleComponent),
  },
  {
    path: 'solicitud/:id/evaluar',
    outlet: 'panel',
    loadComponent: () => import('./solicitud-detalle').then((m) => m.SolicitudDetalleComponent),
  },
  {
    path: 'cuota/:id/pagar',
    outlet: 'panel',
    loadComponent: () => import('./cuota-pago-form').then((m) => m.CuotaPagoFormComponent),
  },
  {
    path: 'cuota/:id/exonerar',
    outlet: 'panel',
    loadComponent: () => import('./cuota-exonerar-form').then((m) => m.CuotaExonerarFormComponent),
  },
];
