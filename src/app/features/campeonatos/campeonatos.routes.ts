import { Routes } from '@angular/router';

export const CAMPEONATO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./campeonato-list').then((m) => m.CampeonatoListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./campeonato-form').then((m) => m.CampeonatoFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./campeonato-detail').then((m) => m.CampeonatoDetailComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./campeonato-form').then((m) => m.CampeonatoFormComponent),
  },
];
