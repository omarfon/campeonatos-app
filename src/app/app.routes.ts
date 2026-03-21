import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/components/layout').then((m) => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'gestion/competencias', pathMatch: 'full' },
      {
        path: 'gestion',
        children: [
          { path: '', redirectTo: 'competencias', pathMatch: 'full' },
          {
            path: 'competencias',
            loadChildren: () => import('./features/competencias/competencias.routes').then((m) => m.COMPETENCIA_ROUTES),
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
      {
        path: 'gestion/competencias/nuevo',
        outlet: 'panel',
        loadComponent: () => import('./features/competencias/competencia-form').then((m) => m.CompetenciaFormComponent),
      },
      {
        path: 'gestion/encuentros/nuevo',
        outlet: 'panel',
        loadComponent: () => import('./features/encuentros/encuentro-form').then((m) => m.EncuentroFormComponent),
      },
      {
        path: 'gestion/resultados/nuevo',
        outlet: 'panel',
        loadComponent: () => import('./features/resultados/resultado-form').then((m) => m.ResultadoFormComponent),
      },
      {
        path: 'academia/cursos/nuevo',
        outlet: 'panel',
        loadComponent: () => import('./features/academia/curso-form').then((m) => m.CursoFormComponent),
      },
      {
        path: 'academia/clases/nueva',
        outlet: 'panel',
        loadComponent: () => import('./features/academia/clase-form').then((m) => m.ClaseFormComponent),
      },
      {
        path: 'academia/matriculas/nueva',
        outlet: 'panel',
        loadComponent: () => import('./features/academia/matricula-form').then((m) => m.MatriculaFormComponent),
      },
      {
        path: 'academia/programas/nuevo',
        outlet: 'panel',
        loadComponent: () => import('./features/academia/programa-form').then((m) => m.ProgramaFormComponent),
      },
      {
        path: 'maestros/disciplinas/nueva',
        outlet: 'panel',
        loadComponent: () => import('./features/disciplinas/disciplina-form').then((m) => m.DisciplinaFormComponent),
      },
      {
        path: 'maestros/equipos/nuevo',
        outlet: 'panel',
        loadComponent: () => import('./features/equipos/equipo-form').then((m) => m.EquipoFormComponent),
      },
      {
        path: 'maestros/sedes/nueva',
        outlet: 'panel',
        loadComponent: () => import('./features/sedes/sede-form').then((m) => m.SedeFormComponent),
      },
      {
        path: 'maestros/socios/nuevo',
        outlet: 'panel',
        loadComponent: () => import('./features/socios/socio-form').then((m) => m.SocioFormComponent),
      },
      {
        path: 'maestros/areas/nueva',
        outlet: 'panel',
        loadComponent: () => import('./features/areas/area-form').then((m) => m.AreaFormComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'competencias' },
];
