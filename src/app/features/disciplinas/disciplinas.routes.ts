import { Routes } from '@angular/router';

export const DISCIPLINA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./disciplina-list').then((m) => m.DisciplinaListComponent),
  },
  {
    path: 'nueva',
    loadComponent: () =>
      import('./disciplina-form').then((m) => m.DisciplinaFormComponent),
  },
  {
    path: 'nueva',
    outlet: 'panel',
    loadComponent: () =>
      import('./disciplina-form').then((m) => m.DisciplinaFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./disciplina-detail').then((m) => m.DisciplinaDetailComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./disciplina-form').then((m) => m.DisciplinaFormComponent),
  },
];
