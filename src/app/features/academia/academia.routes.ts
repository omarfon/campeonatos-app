import { Routes } from '@angular/router';

export const ACADEMIA_ROUTES: Routes = [
  {
    path: 'estructura',
    loadComponent: () => import('./estructura-form').then(m => m.EstructuraFormComponent),
  },
  {
    path: 'ambientes',
    loadComponent: () => import('./ambiente-config').then(m => m.AmbienteConfigComponent),
  },
  {
    path: 'calendario',
    loadComponent: () => import('./programacion-calendar').then(m => m.ProgramacionCalendarComponent),
  },
  {
    path: 'cursos',
    loadComponent: () => import('./academia-list').then(m => m.AcademiaListComponent),
  },
  {
    path: 'cursos/nuevo',
    loadComponent: () => import('./curso-form').then(m => m.CursoFormComponent),
  },
  {
    path: 'cursos/nuevo',
    outlet: 'panel',
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
    path: 'clases/nueva',
    outlet: 'panel',
    loadComponent: () => import('./clase-form').then(m => m.ClaseFormComponent),
  },
  {
    path: 'matriculas/nueva',
    loadComponent: () => import('./matricula-form').then(m => m.MatriculaFormComponent),
  },
  {
    path: 'matriculas/nueva',
    outlet: 'panel',
    loadComponent: () => import('./matricula-form').then(m => m.MatriculaFormComponent),
  },
  {
    path: 'programas',
    loadComponent: () => import('./programa-list').then(m => m.ProgramaListComponent),
  },
  {
    path: 'programas/nuevo',
    loadComponent: () => import('./programa-form').then(m => m.ProgramaFormComponent),
  },
  {
    path: 'programas/nuevo',
    outlet: 'panel',
    loadComponent: () => import('./programa-form').then(m => m.ProgramaFormComponent),
  },
  {
    path: 'programas/:id',
    loadComponent: () => import('./programa-detail').then(m => m.ProgramaDetailComponent),
  },
  { path: '', redirectTo: 'cursos', pathMatch: 'full' },
];
