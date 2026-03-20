import { Routes } from '@angular/router';

export const SOCIO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./socio-list').then((m) => m.SocioListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./socio-form').then((m) => m.SocioFormComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./socio-detail').then((m) => m.SocioDetailComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./socio-form').then((m) => m.SocioFormComponent),
  },
];
