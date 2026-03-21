import { Routes } from '@angular/router';

export const AREA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./area-list').then((m) => m.AreaListComponent),
  },
  {
    path: 'nueva',
    loadComponent: () => import('./area-form').then((m) => m.AreaFormComponent),
  },
  {
    path: 'nueva',
    outlet: 'panel',
    loadComponent: () => import('./area-form').then((m) => m.AreaFormComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./area-detail').then((m) => m.AreaDetailComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./area-form').then((m) => m.AreaFormComponent),
  },
];
