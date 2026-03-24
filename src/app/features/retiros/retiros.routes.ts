import { Routes } from '@angular/router';

export const RETIRO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./retiro-list').then((m) => m.RetiroListComponent),
  },
];
