import { Injectable, computed, signal } from '@angular/core';
import {
  TramiteAcademico,
  TipoTramiteAcademico,
  EstadoTramiteAcademico,
} from '../models/tramite-academico.model';

const MOCK_TRAMITES: TramiteAcademico[] = [
  {
    id: 'ta-001',
    alumnoNombre: 'Lucas Sebastián García Montoya',
    alumnoDni: '74512300',
    cursoNombre: 'Natación Nivel Inicial — Grupo A',
    tipo: 'constancia_matricula',
    estado: 'aprobada',
    fechaCreacion: '2026-03-10',
    fechaUltimaAccion: '2026-03-11',
    descripcion: 'Solicita constancia de matrícula vigente para trámite escolar.',
    operador: 'Recepción',
    evaluador: 'Coord. Académica',
    auditoria: [
      { accion: 'Ingreso de solicitud', usuario: 'Recepción', fechaHora: '2026-03-10T09:15:00', observacion: 'Solicitado presencialmente por apoderado.' },
      { accion: 'Constancia emitida y aprobada', usuario: 'Coord. Académica', fechaHora: '2026-03-11T10:00:00', observacion: 'Documento generado en sistema.' },
    ],
  },
  {
    id: 'ta-002',
    alumnoNombre: 'Sofía Valentina García Montoya',
    alumnoDni: '74512301',
    cursoNombre: 'Ballet Clásico Nivel Inicial',
    tipo: 'cambio_nivel',
    estado: 'en_revision',
    fechaCreacion: '2026-03-15',
    fechaUltimaAccion: '2026-03-15',
    descripcion: 'Solicita evaluación para cambio de nivel Inicial a Intermedio por evolución técnica en los últimos 3 meses.',
    operador: 'Recepción',
    auditoria: [
      { accion: 'Ingreso de solicitud', usuario: 'Recepción', fechaHora: '2026-03-15T11:30:00' },
      { accion: 'Derivada a evaluación docente', usuario: 'Coord. Ballet', fechaHora: '2026-03-15T14:00:00' },
    ],
  },
  {
    id: 'ta-003',
    alumnoNombre: 'Martín Ignacio Fernández Quispe',
    alumnoDni: '73400120',
    cursoNombre: 'Fútbol Sub-14 — Grupo Mañana',
    tipo: 'cambio_clase',
    estado: 'aprobada',
    fechaCreacion: '2026-02-20',
    fechaUltimaAccion: '2026-02-22',
    descripcion: 'Cambio de grupo de fútbol de mañana a tarde por incompatibilidad con horario escolar a partir de marzo.',
    operador: 'Recepción',
    evaluador: 'Coord. Deportes',
    auditoria: [
      { accion: 'Solicitud ingresada', usuario: 'Recepción', fechaHora: '2026-02-20T08:00:00' },
      { accion: 'Cupo verificado en grupo tarde', usuario: 'Coord. Deportes', fechaHora: '2026-02-21T09:00:00', observacion: 'Hay disponibilidad en el grupo de 17:00.' },
      { accion: 'Cambio aprobado y aplicado', usuario: 'Coord. Deportes', fechaHora: '2026-02-22T10:00:00' },
    ],
  },
  {
    id: 'ta-004',
    alumnoNombre: 'Clara Sofía Fernández Quispe',
    alumnoDni: '73400121',
    cursoNombre: 'Natación Adaptada',
    tipo: 'reclamo_asistencia',
    estado: 'aprobada',
    fechaCreacion: '2026-03-05',
    fechaUltimaAccion: '2026-03-07',
    descripcion: 'Reclamo por 2 faltas registradas los días 25/02 y 27/02 que son incorrectas según apoderado. La alumna sí asistió en ambas fechas.',
    operador: 'Recepción',
    evaluador: 'Prof. Natación',
    auditoria: [
      { accion: 'Reclamo ingresado', usuario: 'Recepción', fechaHora: '2026-03-05T10:00:00' },
      { accion: 'Verificado con docente', usuario: 'Prof. Natación', fechaHora: '2026-03-06T12:00:00', observacion: 'Error de sistema confirmado. Se procede a corrección.' },
      { accion: 'Asistencias corregidas', usuario: 'Coord. Académica', fechaHora: '2026-03-07T09:30:00' },
    ],
  },
  {
    id: 'ta-005',
    alumnoNombre: 'Valentina Ríos Paredes',
    alumnoDni: '72100440',
    cursoNombre: 'Tenis Nivel Intermedio',
    tipo: 'baja_curso',
    estado: 'enviada',
    fechaCreacion: '2026-03-18',
    fechaUltimaAccion: '2026-03-18',
    descripcion: 'Solicita baja del curso de tenis por motivos personales a partir del 01/04/2026. Solicita evaluación para posible nota de crédito.',
    operador: 'Portal Web',
    auditoria: [
      { accion: 'Solicitud enviada desde portal', usuario: 'Alumno/Apoderado', fechaHora: '2026-03-18T19:45:00' },
    ],
  },
  {
    id: 'ta-006',
    alumnoNombre: 'Diego Emiliano Ramírez Flores',
    alumnoDni: '70125600',
    cursoNombre: 'Karate-Do Avanzado',
    tipo: 'solicitud_evaluacion',
    estado: 'en_revision',
    fechaCreacion: '2026-03-12',
    fechaUltimaAccion: '2026-03-13',
    descripcion: 'Solicita evaluación para obtener cinturón marrón. Acredita más de 12 meses en el nivel Avanzado intermedio.',
    operador: 'Recepción',
    evaluador: 'Sensei Vásquez',
    auditoria: [
      { accion: 'Solicitud ingresada', usuario: 'Recepción', fechaHora: '2026-03-12T08:30:00' },
      { accion: 'Derivada a Sensei para evaluación', usuario: 'Coord. Artes Marciales', fechaHora: '2026-03-13T11:00:00' },
    ],
  },
  {
    id: 'ta-007',
    alumnoNombre: 'Luciana Beatriz Torres Romero',
    alumnoDni: '71900320',
    cursoNombre: 'Piano Nivel Básico II',
    tipo: 'certificado_notas',
    estado: 'aprobada',
    fechaCreacion: '2026-01-28',
    fechaUltimaAccion: '2026-01-30',
    descripcion: 'Solicita certificado de logros y calificaciones del periodo 2025-II para presentar en concurso externo.',
    operador: 'Recepción',
    evaluador: 'Coord. Música',
    auditoria: [
      { accion: 'Solicitud ingresada', usuario: 'Recepción', fechaHora: '2026-01-28T09:00:00' },
      { accion: 'Calificaciones verificadas', usuario: 'Prof. Piano', fechaHora: '2026-01-29T10:00:00' },
      { accion: 'Certificado emitido', usuario: 'Coord. Música', fechaHora: '2026-01-30T11:00:00', observacion: 'Firmado y sellado. Entregado al apoderado.' },
    ],
  },
  {
    id: 'ta-008',
    alumnoNombre: 'Joaquín Nicolás Álvarez Mendoza',
    alumnoDni: '72880010',
    tipo: 'cambio_datos',
    estado: 'borrador',
    fechaCreacion: '2026-03-22',
    fechaUltimaAccion: '2026-03-22',
    descripcion: 'Actualización de número de teléfono y correo electrónico del apoderado.',
    operador: 'Portal Web',
    auditoria: [
      { accion: 'Borrador creado desde portal', usuario: 'Apoderado', fechaHora: '2026-03-22T20:10:00' },
    ],
  },
  {
    id: 'ta-009',
    alumnoNombre: 'Isabella Renata Gutiérrez Navas',
    alumnoDni: '73000900',
    cursoNombre: 'Danza Contemporánea Intermedio',
    tipo: 'cambio_nivel',
    estado: 'rechazada',
    fechaCreacion: '2026-02-10',
    fechaUltimaAccion: '2026-02-14',
    descripcion: 'Solicita cambio de nivel Intermedio a Avanzado.',
    motivoRechazo: 'La docente indica que la alumna requiere consolidar la técnica intermedia al menos 2 meses más antes de la promoción.',
    operador: 'Recepción',
    evaluador: 'Prof. Danza',
    auditoria: [
      { accion: 'Solicitud ingresada', usuario: 'Recepción', fechaHora: '2026-02-10T08:00:00' },
      { accion: 'Evaluación docente realizada', usuario: 'Prof. Danza', fechaHora: '2026-02-13T15:00:00' },
      { accion: 'Solicitud rechazada', usuario: 'Coord. Danza', fechaHora: '2026-02-14T09:00:00', observacion: 'Se comunicó decisión a apoderado.' },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class TramiteAcademicoService {
  private readonly _tramites = signal<TramiteAcademico[]>(MOCK_TRAMITES);

  readonly tramites = this._tramites.asReadonly();

  readonly tramitesPendientes = computed(() =>
    this._tramites().filter((t) => t.estado === 'enviada' || t.estado === 'en_revision')
  );

  readonly tramitesAprobados = computed(() =>
    this._tramites().filter((t) => t.estado === 'aprobada')
  );

  readonly tramitesRechazados = computed(() =>
    this._tramites().filter((t) => t.estado === 'rechazada')
  );

  getById(id: string): TramiteAcademico | undefined {
    return this._tramites().find((t) => t.id === id);
  }

  crear(datos: Omit<TramiteAcademico, 'id' | 'auditoria' | 'fechaUltimaAccion'>): void {
    const hoy = new Date().toISOString();
    const nuevo: TramiteAcademico = {
      ...datos,
      id: `ta-${String(this._tramites().length + 1).padStart(3, '0')}`,
      fechaUltimaAccion: hoy.slice(0, 10),
      auditoria: [
        { accion: 'Ingreso de solicitud', usuario: datos.operador ?? 'Sistema', fechaHora: hoy },
      ],
    };
    this._tramites.update((ts) => [nuevo, ...ts]);
  }

  aprobar(id: string, evaluador: string, observacion?: string): void {
    const hoy = new Date().toISOString();
    this._tramites.update((ts) =>
      ts.map((t) =>
        t.id === id
          ? {
              ...t,
              estado: 'aprobada' as EstadoTramiteAcademico,
              evaluador,
              fechaUltimaAccion: hoy.slice(0, 10),
              auditoria: [
                ...t.auditoria,
                { accion: 'Solicitud aprobada', usuario: evaluador, fechaHora: hoy, observacion },
              ],
            }
          : t
      )
    );
  }

  rechazar(id: string, evaluador: string, motivo: string): void {
    const hoy = new Date().toISOString();
    this._tramites.update((ts) =>
      ts.map((t) =>
        t.id === id
          ? {
              ...t,
              estado: 'rechazada' as EstadoTramiteAcademico,
              evaluador,
              motivoRechazo: motivo,
              fechaUltimaAccion: hoy.slice(0, 10),
              auditoria: [
                ...t.auditoria,
                { accion: 'Solicitud rechazada', usuario: evaluador, fechaHora: hoy, observacion: motivo },
              ],
            }
          : t
      )
    );
  }

  derivarARevision(id: string, operador: string): void {
    const hoy = new Date().toISOString();
    this._tramites.update((ts) =>
      ts.map((t) =>
        t.id === id
          ? {
              ...t,
              estado: 'en_revision' as EstadoTramiteAcademico,
              fechaUltimaAccion: hoy.slice(0, 10),
              auditoria: [
                ...t.auditoria,
                { accion: 'Derivada a revisión', usuario: operador, fechaHora: hoy },
              ],
            }
          : t
      )
    );
  }
}
