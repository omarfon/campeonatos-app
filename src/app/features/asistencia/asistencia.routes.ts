import { Routes } from '@angular/router';

export const ASISTENCIA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./asistencia-list').then((m) => m.AsistenciaListComponent),
  },
];
