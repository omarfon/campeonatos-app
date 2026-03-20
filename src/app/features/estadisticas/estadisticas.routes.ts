import { Routes } from '@angular/router';

export const ESTADISTICA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./estadisticas-dashboard').then((m) => m.EstadisticasDashboardComponent),
  },
];
