import { Routes } from '@angular/router';

export const ACADEMIA_ROUTES: Routes = [
  {
    path: 'cursos',
    loadComponent: () => import('./academia-list').then(m => m.AcademiaListComponent),
  },
  {
    path: 'cursos/nuevo',
    loadComponent: () => import('./curso-form').then(m => m.CursoFormComponent),
  },
  {
    path: 'cursos/:id',
    loadComponent: () => import('./curso-detail').then(m => m.CursoDetailComponent),
  },
  {
    path: 'cursos/:id/editar',
    loadComponent: () => import('./curso-form').then(m => m.CursoFormComponent),
  },
  {
    path: 'clases/nueva',
    loadComponent: () => import('./clase-form').then(m => m.ClaseFormComponent),
  },
  {
    path: 'programas',
    loadComponent: () => import('./programa-list').then(m => m.ProgramaListComponent),
  },
  {
    path: 'programas/:id',
    loadComponent: () => import('./programa-detail').then(m => m.ProgramaDetailComponent),
  },
  { path: '', redirectTo: 'cursos', pathMatch: 'full' },
];
