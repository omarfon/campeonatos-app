import { Routes } from '@angular/router';

export const ENCUENTRO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./encuentro-list').then((m) => m.EncuentroListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./encuentro-form').then((m) => m.EncuentroFormComponent),
  },
  {
    path: 'nuevo',
    outlet: 'panel',
    loadComponent: () => import('./encuentro-form').then((m) => m.EncuentroFormComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./encuentro-detail').then((m) => m.EncuentroDetailComponent),
  },
  {
    path: ':id/control-pre-partido',
    loadComponent: () => import('./control-pre-partido').then((m) => m.ControlPrePartidoComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./encuentro-form').then((m) => m.EncuentroFormComponent),
  },
];
