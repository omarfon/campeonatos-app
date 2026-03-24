import { Injectable, computed, inject, signal } from '@angular/core';
import {
  SesionAsistencia,
  RegistroAsistenciaAlumno,
  IncidenciaClase,
  ControlAsistenciaDocente,
  EstadoAsistenciaDocente,
  EstadoAsistenciaAlumno,
} from '../models/asistencia.model';
import { AcademiaService } from './academia.service';
import { AcademiaMatriculaService } from './academia-matricula.service';
import { SocioService } from './socio.service';

// ──── Mock: Sesiones ────

const MOCK_SESIONES: SesionAsistencia[] = [
  {
    id: 'ses-1',
    claseId: 'cls-nat-ninos-prin',
    fecha: '2026-03-20',
    horaInicio: '08:00',
    horaFin: '09:00',
    horaRealInicio: '08:05',
    horaRealFin: '09:00',
    estado: 'tomada',
    creadoEn: '2026-03-20T08:00:00Z',
  },
  {
    id: 'ses-2',
    claseId: 'cls-nat-ninos-prin',
    fecha: '2026-03-22',
    horaInicio: '08:00',
    horaFin: '09:00',
    estado: 'pendiente',
    creadoEn: '2026-03-22T07:00:00Z',
  },
  {
    id: 'ses-3',
    claseId: 'cls-kar-ninos-blanc',
    fecha: '2026-03-20',
    horaInicio: '10:00',
    horaFin: '11:00',
    horaRealInicio: '10:00',
    horaRealFin: '11:00',
    estado: 'tomada',
    creadoEn: '2026-03-20T10:00:00Z',
  },
  {
    id: 'ses-4',
    claseId: 'cls-kar-ninos-blanc',
    fecha: '2026-03-22',
    horaInicio: '10:00',
    horaFin: '11:00',
    estado: 'pendiente',
    creadoEn: '2026-03-22T09:00:00Z',
  },
  {
    id: 'ses-5',
    claseId: 'cls-nat-ninos-prin',
    fecha: '2026-03-18',
    horaInicio: '08:00',
    horaFin: '09:00',
    horaRealInicio: '08:00',
    horaRealFin: '09:00',
    estado: 'tomada',
    creadoEn: '2026-03-18T08:00:00Z',
  },
];

// ──── Mock: Registros de alumnos ────

const MOCK_REGISTROS: RegistroAsistenciaAlumno[] = [
  { id: 'reg-1', sesionId: 'ses-1', socioId: 'socio-1', estado: 'asistio' },
  { id: 'reg-2', sesionId: 'ses-1', socioId: 'socio-3', estado: 'no_asistio' },
  { id: 'reg-3', sesionId: 'ses-3', socioId: 'socio-2', estado: 'asistio' },
  { id: 'reg-4', sesionId: 'ses-3', socioId: 'socio-4', estado: 'tardanza', observaciones: 'Llegó 10 min tarde' },
  { id: 'reg-5', sesionId: 'ses-5', socioId: 'socio-1', estado: 'asistio' },
  { id: 'reg-6', sesionId: 'ses-5', socioId: 'socio-3', estado: 'justificado', observaciones: 'Constancia médica presentada' },
];

// ──── Mock: Incidencias ────

const MOCK_INCIDENCIAS: IncidenciaClase[] = [
  {
    id: 'inc-1',
    sesionId: 'ses-1',
    tipo: 'infraestructura',
    descripcion: 'El arco de la piscina principal está dañado, se reporta para mantenimiento.',
    creadoEn: '2026-03-20T09:10:00Z',
  },
  {
    id: 'inc-2',
    sesionId: 'ses-3',
    tipo: 'disciplina',
    descripcion: 'Alumno mostró conducta agresiva con compañero durante el sparring.',
    socioIdsInvolucrados: ['socio-4'],
    creadoEn: '2026-03-20T11:05:00Z',
  },
];

// ──── Mock: Control de Docentes ────

const MOCK_CONTROL_DOCENTES: ControlAsistenciaDocente[] = [
  {
    id: 'ctrl-1',
    sesionId: 'ses-1',
    docenteId: 'doc-1',
    estado: 'tardanza',
    minutosTardanza: 5,
    controladorNombre: 'Sergio Quispe',
    observaciones: 'Docente llegó 5 minutos tarde por tema de estacionamiento.',
    fechaRegistro: '2026-03-20T08:30:00Z',
  },
  {
    id: 'ctrl-2',
    sesionId: 'ses-3',
    docenteId: 'doc-2',
    estado: 'presente',
    controladorNombre: 'Sergio Quispe',
    fechaRegistro: '2026-03-20T10:30:00Z',
  },
  {
    id: 'ctrl-3',
    sesionId: 'ses-5',
    docenteId: 'doc-1',
    estado: 'con_suplente',
    docenteSustitutoId: 'doc-8',
    controladorNombre: 'Carmen Rodríguez',
    observaciones: 'Docente titular reportó enfermedad. Suplente: Carlos Méndez.',
    fechaRegistro: '2026-03-18T08:10:00Z',
  },
];

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private readonly academiaService = inject(AcademiaService);
  private readonly matriculaService = inject(AcademiaMatriculaService);
  private readonly socioService = inject(SocioService);

  private readonly _sesiones = signal<SesionAsistencia[]>(MOCK_SESIONES);
  private readonly _registros = signal<RegistroAsistenciaAlumno[]>(MOCK_REGISTROS);
  private readonly _incidencias = signal<IncidenciaClase[]>(MOCK_INCIDENCIAS);
  private readonly _controles = signal<ControlAsistenciaDocente[]>(MOCK_CONTROL_DOCENTES);

  readonly sesiones = this._sesiones.asReadonly();
  readonly registros = this._registros.asReadonly();
  readonly incidencias = this._incidencias.asReadonly();
  readonly controles = this._controles.asReadonly();

  readonly sesionesDetalladas = computed(() =>
    this._sesiones().map((s) => {
      const clase = this.academiaService.getClaseById(s.claseId);
      const curso = clase ? this.academiaService.getCursoById(clase.cursoId) : undefined;
      const docente = clase ? this.academiaService.getDocenteById(clase.docenteId) : undefined;
      const totalAlumnos = this.matriculaService.matriculas().filter(
        (m) => m.claseId === s.claseId && m.estado === 'activa'
      ).length;
      const registrosSesion = this._registros().filter((r) => r.sesionId === s.id);
      const incidenciasSesion = this._incidencias().filter((i) => i.sesionId === s.id);
      const control = this._controles().find((c) => c.sesionId === s.id);
      return {
        ...s,
        cursoNombre: curso?.nombre ?? '—',
        docenteNombre: docente ? `${docente.nombre} ${docente.apellido}` : '—',
        periodo: clase?.periodo ?? '—',
        totalAlumnos,
        asistieron: registrosSesion.filter((r) => r.estado === 'asistio').length,
        incidencias: incidenciasSesion.length,
        controlDocente: control,
      };
    }).sort((a, b) => b.fecha.localeCompare(a.fecha))
  );

  readonly totalesPorEstado = computed(() => ({
    pendientes: this._sesiones().filter((s) => s.estado === 'pendiente').length,
    tomadas: this._sesiones().filter((s) => s.estado === 'tomada').length,
    canceladas: this._sesiones().filter((s) => s.estado === 'cancelada').length,
  }));

  // ──── Roster ────

  /** Genera la nómina de alumnos matriculados en una sesión */
  getRoster(sesionId: string) {
    const sesion = this._sesiones().find((s) => s.id === sesionId);
    if (!sesion) return [];
    const matriculas = this.matriculaService.matriculas().filter(
      (m) => m.claseId === sesion.claseId && m.estado === 'activa'
    );
    return matriculas.map((m) => {
      const socio = this.socioService.getById(m.socioId);
      const registroExistente = this._registros().find(
        (r) => r.sesionId === sesionId && r.socioId === m.socioId
      );
      return {
        socioId: m.socioId,
        nombre: socio ? `${socio.apellido}, ${socio.nombre}` : m.socioId,
        dni: socio?.dni ?? '—',
        condicion: socio?.condicionInstitucional ?? 'no_socio',
        estadoAsistencia: registroExistente?.estado ?? null,
        observaciones: registroExistente?.observaciones ?? '',
      };
    }).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  // ──── Sesiones CRUD ────

  generarSesionesDelDia(fecha: string): void {
    const clases = this.academiaService.clases().filter((c) => c.estado === 'abierta');
    const nuevas: SesionAsistencia[] = [];
    clases.forEach((clase) => {
      const existe = this._sesiones().some((s) => s.claseId === clase.id && s.fecha === fecha);
      if (!existe && clase.horarios.length > 0) {
        nuevas.push({
          id: `ses-${Date.now()}-${clase.id}`,
          claseId: clase.id,
          fecha,
          horaInicio: clase.horarios[0].horaInicio,
          horaFin: clase.horarios[0].horaFin,
          estado: 'pendiente',
          creadoEn: new Date().toISOString(),
        });
      }
    });
    if (nuevas.length > 0) {
      this._sesiones.update((prev) => [...prev, ...nuevas]);
    }
  }

  getSesionById(id: string): SesionAsistencia | undefined {
    return this._sesiones().find((s) => s.id === id);
  }

  getSesionesByClase(claseId: string): SesionAsistencia[] {
    return this._sesiones().filter((s) => s.claseId === claseId);
  }

  // ──── Registros de asistencia ────

  guardarAsistencia(
    sesionId: string,
    registros: Array<{ socioId: string; estado: EstadoAsistenciaAlumno; observaciones?: string }>
  ): void {
    const nuevosRegistros: RegistroAsistenciaAlumno[] = registros.map((r) => ({
      id: `reg-${Date.now()}-${r.socioId}`,
      sesionId,
      socioId: r.socioId,
      estado: r.estado,
      observaciones: r.observaciones,
    }));
    // Eliminar registros previos de la sesión y reemplazar
    this._registros.update((prev) => [
      ...prev.filter((r) => r.sesionId !== sesionId),
      ...nuevosRegistros,
    ]);
    // Marcar sesión como tomada
    this._sesiones.update((prev) =>
      prev.map((s) => (s.id === sesionId ? { ...s, estado: 'tomada' } : s))
    );
  }

  // ──── Incidencias ────

  agregarIncidencia(
    sesionId: string,
    incidencia: Omit<IncidenciaClase, 'id' | 'creadoEn'>
  ): void {
    const nueva: IncidenciaClase = {
      ...incidencia,
      id: `inc-${Date.now()}`,
      creadoEn: new Date().toISOString(),
    };
    this._incidencias.update((prev) => [...prev, nueva]);
  }

  // ──── Control de Docentes ────

  registrarControlDocente(control: Omit<ControlAsistenciaDocente, 'id'>): void {
    const nuevo: ControlAsistenciaDocente = {
      ...control,
      id: `ctrl-${Date.now()}`,
    };
    this._controles.update((prev) => [
      ...prev.filter((c) => c.sesionId !== control.sesionId),
      nuevo,
    ]);
  }

  getControlBySesion(sesionId: string): ControlAsistenciaDocente | undefined {
    return this._controles().find((c) => c.sesionId === sesionId);
  }

  getIncidenciasBySesion(sesionId: string): IncidenciaClase[] {
    return this._incidencias().filter((i) => i.sesionId === sesionId);
  }
}
