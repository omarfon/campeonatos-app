import { Routes } from '@angular/router';

export const SANCION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./sancion-list').then((m) => m.SancionListComponent),
  },
  {
    path: 'tarjeta',
    loadComponent: () => import('./tarjeta-form').then((m) => m.TarjetaFormComponent),
  },
  {
    path: 'sancion',
    loadComponent: () => import('./sancion-form').then((m) => m.SancionFormComponent),
  },
  {
    path: 'resolucion',
    loadComponent: () => import('./resolucion-form').then((m) => m.ResolucionFormComponent),
  },
];
