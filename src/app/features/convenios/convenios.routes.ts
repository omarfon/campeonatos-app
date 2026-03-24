import { Routes } from '@angular/router';
import { ConvenioListComponent } from './convenio-list';

export const CONVENIO_ROUTES: Routes = [
  { path: '', loadComponent: () => Promise.resolve(ConvenioListComponent) },
];
