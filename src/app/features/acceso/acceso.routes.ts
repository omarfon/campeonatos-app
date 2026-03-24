import { Routes } from '@angular/router';

export const ACCESO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./acceso-monitor').then((m) => m.AccesoMonitorComponent),
  },
  {
    path: 'penalidades',
    loadComponent: () => import('./penalidad-list').then((m) => m.PenalidadListComponent),
  },
];
