import { Routes } from '@angular/router';

export const RECUPERACION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./recuperacion-list').then((m) => m.RecuperacionListComponent),
  },
];
