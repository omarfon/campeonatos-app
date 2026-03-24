import { Routes } from '@angular/router';

export const TRAMITES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./tramite-academico-list').then((m) => m.TramiteAcademicoListComponent),
  },
];
