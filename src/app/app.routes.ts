import { Routes } from '@angular/router';
import { studentAuthGuard, studentGuestGuard } from './features/student-portal/guards/student-auth.guard';
import { memberAuthGuard, memberGuestGuard } from './features/member-portal/guards/member-auth.guard';
import { appAuthGuard, appGuestGuard } from './core/guards/app-auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [appGuestGuard],
    loadComponent: () => import('./features/auth/pages/login/app-login').then(m => m.AppLoginComponent),
  },
  {
    path: 'socio/login',
    canActivate: [memberGuestGuard],
    loadComponent: () => import('./features/member-portal/pages/login/member-login').then(m => m.MemberLoginComponent),
  },
  {
    path: 'portal-alumno/login',
    canActivate: [studentGuestGuard],
    loadComponent: () => import('./features/student-portal/pages/login/student-login').then(m => m.StudentLoginComponent),
  },
  {
    path: 'portal/eventos',
    loadChildren: () => import('./features/events/events.routes').then(m => m.PORTAL_EVENT_ROUTES),
  },
  {
    path: 'socio',
    canActivate: [memberAuthGuard],
    loadComponent: () => import('./features/member-portal/layout/member-portal-layout').then(m => m.MemberPortalLayoutComponent),
    loadChildren: () => import('./features/member-portal/member-portal.routes').then(m => m.MEMBER_PORTAL_ROUTES),
  },
  {
    path: 'portal-alumno',
    canActivate: [studentAuthGuard],
    loadComponent: () => import('./features/student-portal/layout/student-portal-layout').then(m => m.StudentPortalLayoutComponent),
    loadChildren: () => import('./features/student-portal/student-portal.routes').then(m => m.STUDENT_PORTAL_ROUTES),
  },
  {
    path: '',
    canActivate: [appAuthGuard],
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
        path: 'clases',
        loadChildren: () => import('./features/classes/classes.routes').then((m) => m.CLASSES_ROUTES),
      },
      {
        path: 'matricula',
        loadChildren: () => import('./features/matricula/matricula.routes').then((m) => m.MATRICULA_ROUTES),
      },
      {
        path: 'reportes',
        loadChildren: () => import('./features/reportes/reportes.routes').then((m) => m.REPORTE_ROUTES),
      },
      {
        path: 'comercial',
        children: [
          { path: '', redirectTo: 'tarifas', pathMatch: 'full' },
          {
            path: 'tarifas',
            loadChildren: () => import('./features/precios/precios.routes').then((m) => m.PRECIOS_ROUTES),
          },
          {
            path: 'convenios',
            loadChildren: () => import('./features/convenios/convenios.routes').then((m) => m.CONVENIO_ROUTES),
          },
        ],
      },
      {
        path: 'tramites',
        loadChildren: () => import('./features/tramites/tramites.routes').then((m) => m.TRAMITES_ROUTES),
      },
      {
        path: 'asistencia',
        loadChildren: () => import('./features/asistencia/asistencia.routes').then((m) => m.ASISTENCIA_ROUTES),
      },
      {
        path: 'acceso',
        loadChildren: () => import('./features/acceso/acceso.routes').then((m) => m.ACCESO_ROUTES),
      },
      {
        path: 'eventos',
        loadChildren: () => import('./features/events/events.routes').then((m) => m.EVENT_ROUTES),
      },
      {
        path: 'operaciones',
        children: [
          { path: '', redirectTo: 'recuperaciones', pathMatch: 'full' },
          {
            path: 'recuperaciones',
            loadChildren: () => import('./features/recuperaciones/recuperaciones.routes').then((m) => m.RECUPERACION_ROUTES),
          },
          {
            path: 'retiros',
            loadChildren: () => import('./features/retiros/retiros.routes').then((m) => m.RETIRO_ROUTES),
          },
          {
            path: 'notas-credito',
            loadChildren: () => import('./features/notas-credito/notas-credito.routes').then((m) => m.NOTAS_CREDITO_ROUTES),
          },
        ],
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
        path: 'matricula/estudiantes/:id/editar',
        outlet: 'panel',
        loadComponent: () => import('./features/matricula/pages/students/enrollment-student-form').then((m) => m.EnrollmentStudentFormComponent),
      },
      {
        path: 'matricula/estudiantes/nuevo',
        outlet: 'panel',
        loadComponent: () => import('./features/matricula/pages/students/enrollment-student-form').then((m) => m.EnrollmentStudentFormComponent),
      },
      {
        path: 'matricula/convenios/nuevo',
        outlet: 'panel',
        loadComponent: () => import('./features/matricula/pages/agreements/enrollment-agreement-form').then((m) => m.EnrollmentAgreementFormComponent),
      },
      {
        path: 'matricula/convenios/:id/editar',
        outlet: 'panel',
        loadComponent: () => import('./features/matricula/pages/agreements/enrollment-agreement-form').then((m) => m.EnrollmentAgreementFormComponent),
      },
      {
        path: 'matricula/nueva',
        outlet: 'panel',
        loadComponent: () => import('./features/matricula/pages/enrollment-wizard/enrollment-wizard').then((m) => m.EnrollmentWizardComponent),
      },
      {
        path: 'matricula/dashboard/:id',
        outlet: 'panel',
        loadComponent: () => import('./features/matricula/dashboard-curso-detalle').then((m) => m.DashboardCursoDetalleComponent),
      },
      {
        path: 'gestion/sanciones/tarjeta',
        outlet: 'panel',
        loadComponent: () => import('./features/sanciones/tarjeta-form').then((m) => m.TarjetaFormComponent),
      },
      {
        path: 'gestion/sanciones/sancion',
        outlet: 'panel',
        loadComponent: () => import('./features/sanciones/sancion-form').then((m) => m.SancionFormComponent),
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
        path: 'maestros/socios/:id/detalle',
        outlet: 'panel',
        loadComponent: () => import('./features/socios/socio-detail').then((m) => m.SocioDetailComponent),
      },
      {
        path: 'maestros/socios/:id/editar',
        outlet: 'panel',
        loadComponent: () => import('./features/socios/socio-form').then((m) => m.SocioFormComponent),
      },
      {
        path: 'maestros/socios/solicitud/nueva',
        outlet: 'panel',
        loadComponent: () => import('./features/socios/solicitud-form').then((m) => m.SolicitudFormComponent),
      },
      {
        path: 'maestros/socios/solicitud/:id/evaluar',
        outlet: 'panel',
        loadComponent: () => import('./features/socios/solicitud-detalle').then((m) => m.SolicitudDetalleComponent),
      },
      {
        path: 'maestros/socios/cuota/:id/pagar',
        outlet: 'panel',
        loadComponent: () => import('./features/socios/cuota-pago-form').then((m) => m.CuotaPagoFormComponent),
      },
      {
        path: 'maestros/socios/cuota/:id/exonerar',
        outlet: 'panel',
        loadComponent: () => import('./features/socios/cuota-exonerar-form').then((m) => m.CuotaExonerarFormComponent),
      },
      {
        path: 'maestros/areas/nueva',
        outlet: 'panel',
        loadComponent: () => import('./features/areas/area-form').then((m) => m.AreaFormComponent),
      },
      {
        path: 'operaciones/recuperaciones/nueva',
        outlet: 'panel',
        loadComponent: () => import('./features/recuperaciones/recuperacion-form').then((m) => m.RecuperacionFormComponent),
      },
      {
        path: 'operaciones/recuperaciones/:id/evaluar',
        outlet: 'panel',
        loadComponent: () => import('./features/recuperaciones/recuperacion-autorizar').then((m) => m.RecuperacionAutorizarComponent),
      },
      {
        path: 'operaciones/retiros/nuevo',
        outlet: 'panel',
        loadComponent: () => import('./features/retiros/retiro-form').then((m) => m.RetiroFormComponent),
      },
      {
        path: 'comercial/tarifas/nueva',
        outlet: 'panel',
        loadComponent: () => import('./features/precios/tarifa-form').then((m) => m.TarifaFormComponent),
      },
      {
        path: 'comercial/campanas/nueva',
        outlet: 'panel',
        loadComponent: () => import('./features/precios/campana-form').then((m) => m.CampanaFormComponent),
      },
      {
        path: 'comercial/convenios/nuevo',
        outlet: 'panel',
        loadComponent: () => import('./features/convenios/convenio-form').then((m) => m.ConvenioFormComponent),
      },
      {
        path: 'comercial/convenios/:id/detalle',
        outlet: 'panel',
        loadComponent: () => import('./features/convenios/convenio-detalle').then((m) => m.ConvenioDetalleComponent),
      },
      {
        path: 'comercial/convenios/:id/beneficiarios',
        outlet: 'panel',
        loadComponent: () => import('./features/convenios/convenio-beneficiarios').then((m) => m.ConvenioBeneficiariosComponent),
      },
      {
        path: 'asistencia/:sesionId/roster',
        outlet: 'panel',
        loadComponent: () => import('./features/asistencia/roster-view').then((m) => m.RosterViewComponent),
      },
      {
        path: 'asistencia/:sesionId/registrar',
        outlet: 'panel',
        loadComponent: () => import('./features/asistencia/asistencia-form').then((m) => m.AsistenciaFormComponent),
      },
      {
        path: 'asistencia/:sesionId/docente',
        outlet: 'panel',
        loadComponent: () => import('./features/asistencia/docente-control-form').then((m) => m.DocenteControlFormComponent),
      },
      {
        path: 'acceso/carnets',
        outlet: 'panel',
        loadComponent: () => import('./features/acceso/carnet-list').then((m) => m.CarnetListComponent),
      },
      {
        path: 'acceso/penalidades/:id/exonerar',
        outlet: 'panel',
        loadComponent: () => import('./features/acceso/penalidad-form').then((m) => m.PenalidadFormComponent),
      },
      {
        path: 'tramites/nuevo',
        outlet: 'panel',
        loadComponent: () => import('./features/tramites/tramite-academico-form').then((m) => m.TramiteAcademicoFormComponent),
      },
      {
        path: 'tramites/:id/detalle',
        outlet: 'panel',
        loadComponent: () => import('./features/tramites/tramite-academico-detalle').then((m) => m.TramiteAcademicoDetalleComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'competencias' },
];
