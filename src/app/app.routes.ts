import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/components/layout').then((m) => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'gestion/campeonatos', pathMatch: 'full' },
      {
        path: 'gestion',
        children: [
          { path: '', redirectTo: 'campeonatos', pathMatch: 'full' },
          {
            path: 'campeonatos',
            loadChildren: () => import('./features/campeonatos/campeonatos.routes').then((m) => m.CAMPEONATO_ROUTES),
          },
          {
            path: 'encuentros',
            loadChildren: () => import('./features/encuentros/encuentros.routes').then((m) => m.ENCUENTRO_ROUTES),
          },
          {
            path: 'resultados',
            loadChildren: () => import('./features/resultados/resultados.routes').then((m) => m.RESULTADO_ROUTES),
          },
          {
            path: 'sanciones',
            loadChildren: () => import('./features/sanciones/sanciones.routes').then((m) => m.SANCION_ROUTES),
          },
          {
            path: 'estadisticas',
            loadChildren: () => import('./features/estadisticas/estadisticas.routes').then((m) => m.ESTADISTICA_ROUTES),
          },
        ],
      },
      {
        path: 'maestros',
        children: [
          { path: '', redirectTo: 'disciplinas', pathMatch: 'full' },
          {
            path: 'disciplinas',
            loadChildren: () => import('./features/disciplinas/disciplinas.routes').then((m) => m.DISCIPLINA_ROUTES),
          },
          {
            path: 'equipos',
            loadChildren: () => import('./features/equipos/equipos.routes').then((m) => m.EQUIPO_ROUTES),
          },
          {
            path: 'sedes',
            loadChildren: () => import('./features/sedes/sedes.routes').then((m) => m.SEDE_ROUTES),
          },
          {
            path: 'socios',
            loadChildren: () => import('./features/socios/socios.routes').then((m) => m.SOCIO_ROUTES),
          },
          {
            path: 'areas',
            loadChildren: () => import('./features/areas/areas.routes').then((m) => m.AREA_ROUTES),
          },
        ],
      },
      {
        path: 'academia',
        loadChildren: () => import('./features/academia/academia.routes').then((m) => m.ACADEMIA_ROUTES),
      },
      {
        path: 'reportes',
        loadChildren: () => import('./features/reportes/reportes.routes').then((m) => m.REPORTE_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: 'campeonatos' },
];
