import { Routes } from '@angular/router';

export const NOTAS_CREDITO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./nota-credito-list').then((m) => m.NotaCreditoListComponent),
  },
];
