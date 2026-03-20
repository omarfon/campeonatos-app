import { Routes } from '@angular/router';

export const REPORTE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./reporte-generator').then((m) => m.ReporteGeneratorComponent),
  },
];
