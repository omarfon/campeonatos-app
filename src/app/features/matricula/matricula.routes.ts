import { Routes } from '@angular/router';

export const MATRICULA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./matricula-list').then((m) => m.MatriculaListComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard-cursos').then((m) => m.DashboardCursosComponent),
  },
  {
    path: 'nueva',
    loadComponent: () => import('./matricula-module-form').then((m) => m.MatriculaModuleFormComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./matricula-detail').then((m) => m.MatriculaDetailComponent),
  },
];
