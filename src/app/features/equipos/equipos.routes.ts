import { Routes } from '@angular/router';

export const EQUIPO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./equipo-list').then((m) => m.EquipoListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./equipo-form').then((m) => m.EquipoFormComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./equipo-detail').then((m) => m.EquipoDetailComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./equipo-form').then((m) => m.EquipoFormComponent),
  },
];
