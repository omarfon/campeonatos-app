import { Routes } from '@angular/router';

export const RESULTADO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./resultado-list').then((m) => m.ResultadoListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./resultado-form').then((m) => m.ResultadoFormComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./resultado-form').then((m) => m.ResultadoFormComponent),
  },
];
