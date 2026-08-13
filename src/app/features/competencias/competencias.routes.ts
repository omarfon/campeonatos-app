import { Routes } from '@angular/router';

export const COMPETENCIA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./competencia-list').then((m) => m.CompetenciaListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./competencia-form').then((m) => m.CompetenciaFormComponent),
  },
  {
    path: 'nuevo',
    outlet: 'panel',
    loadComponent: () =>
      import('./competencia-form').then((m) => m.CompetenciaFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./competencia-detail').then((m) => m.CompetenciaDetailComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./competencia-form').then((m) => m.CompetenciaFormComponent),
  },
  {
    path: ':id/disciplinas',
    loadComponent: () =>
      import('./competencia-disciplinas').then((m) => m.CompetenciaDisciplinasComponent),
  },
];
