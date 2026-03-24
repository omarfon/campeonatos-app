import { Routes } from '@angular/router';
import { TarifaListComponent } from './tarifa-list';

export const PRECIOS_ROUTES: Routes = [
  { path: '', loadComponent: () => Promise.resolve(TarifaListComponent) },
];
