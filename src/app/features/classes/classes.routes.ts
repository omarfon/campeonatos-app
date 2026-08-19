import { Routes } from '@angular/router';

export const CLASSES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/class-list/class-list').then(m => m.ClassListPage),
  },
  {
    path: 'nueva',
    loadComponent: () => import('./pages/class-create/class-create').then(m => m.ClassCreatePage),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/class-detail/class-detail').then(m => m.ClassDetailPage),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./pages/class-edit/class-edit').then(m => m.ClassEditPage),
  },
];
