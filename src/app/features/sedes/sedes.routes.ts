import { Routes } from '@angular/router';

export const SEDE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./sede-list').then((m) => m.SedeListComponent),
  },
  {
    path: 'nueva',
    loadComponent: () => import('./sede-form').then((m) => m.SedeFormComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./sede-detail').then((m) => m.SedeDetailComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./sede-form').then((m) => m.SedeFormComponent),
  },
];
