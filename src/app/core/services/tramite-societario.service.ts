import { Injectable, computed, signal } from '@angular/core';
import {
  SolicitudSocietaria,
  TipoTramite,
  EstadoSolicitud,
} from '../models/tramite-societario.model';

const MOCK_SOLICITUDES: SolicitudSocietaria[] = [
  {
    id: 'sol-1',
    socioId: 'socio-1',
    tipo: 'cambio_condicion',
    estado: 'en_evaluacion',
    fechaCreacion: '2025-05-10',
    fechaUltimaAccion: '2025-05-12',
    descripcion: 'Solicita cambio de condición individual a familiar por incorporación de cónyuge.',
    documentos: [
      { id: 'doc-1', nombre: 'Acta de matrimonio', tipo: 'pdf', url: '/docs/acta-mat.pdf', cargadoEn: '2025-05-10', cargadoPor: 'Operador Mesa' },
    ],
    auditoria: [
      { accion: 'Creación de solicitud', usuario: 'Operador Mesa', fechaHora: '2025-05-10T09:00:00', observacion: 'Ingresada por ventanilla' },
      { accion: 'Derivada a evaluación', usuario: 'Operador Mesa', fechaHora: '2025-05-12T10:30:00' },
    ],
    operador: 'Operador Mesa',
    evaluador: 'Lic. Pérez',
  },
  {
    id: 'sol-2',
    socioId: 'socio-2',
    tipo: 'suspension_viaje',
    estado: 'aprobada',
    fechaCreacion: '2025-04-01',
    fechaUltimaAccion: '2025-04-03',
    descripcion: 'Suspensión de 3 meses por viaje al exterior por motivos laborales.',
    documentos: [
      { id: 'doc-2', nombre: 'Pasajes aéreos', tipo: 'pdf', url: '/docs/pasajes.pdf', cargadoEn: '2025-04-01', cargadoPor: 'Operador Mesa' },
    ],
    auditoria: [
      { accion: 'Creación de solicitud', usuario: 'Operador Mesa', fechaHora: '2025-04-01T08:00:00' },
      { accion: 'Aprobada', usuario: 'Gerencia', fechaHora: '2025-04-03T14:00:00', observacion: 'Documentación en regla' },
    ],
    operador: 'Operador Mesa',
    aprobador: 'Gerencia',
    vigenciaInicio: '2025-04-10',
    vigenciaFin: '2025-07-10',
  },
  {
    id: 'sol-3',
    socioId: 'socio-3',
    tipo: 'suspension_salud',
    estado: 'enviada',
    fechaCreacion: '2025-05-20',
    fechaUltimaAccion: '2025-05-20',
    descripcion: 'Suspensión por intervención quirúrgica con período de recuperación de 60 días.',
    documentos: [
      { id: 'doc-3', nombre: 'Certificado médico', tipo: 'pdf', url: '/docs/cert-med.pdf', cargadoEn: '2025-05-20', cargadoPor: 'Familiar' },
    ],
    auditoria: [
      { accion: 'Creación de solicitud', usuario: 'Familiar', fechaHora: '2025-05-20T11:00:00' },
    ],
    operador: 'Recepción',
  },
  {
    id: 'sol-4',
    socioId: 'socio-4',
    tipo: 'baja_renuncia',
    estado: 'aprobada',
    fechaCreacion: '2024-11-15',
    fechaUltimaAccion: '2024-11-20',
    descripcion: 'Renuncia voluntaria a la membresía por traslado de domicilio.',
    documentos: [],
    auditoria: [
      { accion: 'Creación de solicitud', usuario: 'Operador Mesa', fechaHora: '2024-11-15T09:00:00' },
      { accion: 'Aprobada', usuario: 'Gerencia', fechaHora: '2024-11-20T10:00:00', observacion: 'Renuncia voluntaria procesada' },
    ],
    operador: 'Operador Mesa',
    aprobador: 'Gerencia',
  },
  {
    id: 'sol-5',
    socioId: 'socio-5',
    tipo: 'alta_dependiente',
    estado: 'rechazada',
    fechaCreacion: '2025-03-10',
    fechaUltimaAccion: '2025-03-15',
    descripcion: 'Solicita alta de dependiente (hijo menor de edad) en condición familiar.',
    documentos: [
      { id: 'doc-5', nombre: 'Partida de nacimiento', tipo: 'pdf', url: '/docs/nacimiento.pdf', cargadoEn: '2025-03-10', cargadoPor: 'Operador Mesa' },
    ],
    auditoria: [
      { accion: 'Creación de solicitud', usuario: 'Operador Mesa', fechaHora: '2025-03-10T09:00:00' },
      { accion: 'Derivada a evaluación', usuario: 'Operador Mesa', fechaHora: '2025-03-12T10:00:00' },
      { accion: 'Rechazada', usuario: 'Lic. Pérez', fechaHora: '2025-03-15T14:00:00', observacion: 'Documentación incompleta' },
    ],
    motivoRechazo: 'Documentación incompleta. Falta constancia de dependencia económica.',
    operador: 'Operador Mesa',
    evaluador: 'Lic. Pérez',
  },
  {
    id: 'sol-6',
    socioId: 'socio-6',
    tipo: 'habilidad_diferente',
    estado: 'en_evaluacion',
    fechaCreacion: '2025-05-22',
    fechaUltimaAccion: '2025-05-23',
    descripcion: 'Acreditación de discapacidad para aplicar protección de permanencia especial.',
    documentos: [
      { id: 'doc-6', nombre: 'Certificado CONADIS', tipo: 'pdf', url: '/docs/conadis.pdf', cargadoEn: '2025-05-22', cargadoPor: 'Operador Mesa' },
    ],
    auditoria: [
      { accion: 'Creación de solicitud', usuario: 'Operador Mesa', fechaHora: '2025-05-22T09:00:00' },
      { accion: 'Derivada a evaluación', usuario: 'Operador Mesa', fechaHora: '2025-05-23T10:00:00' },
    ],
    operador: 'Operador Mesa',
    evaluador: 'Lic. Pérez',
  },
];

@Injectable({ providedIn: 'root' })
export class TramiteSocietarioService {
  private readonly _solicitudes = signal<SolicitudSocietaria[]>(MOCK_SOLICITUDES);
  readonly solicitudes = this._solicitudes.asReadonly();

  readonly solicitudesPendientes = computed(() =>
    this._solicitudes().filter((s) => s.estado === 'enviada' || s.estado === 'en_evaluacion')
  );

  readonly solicitudesAprobadas = computed(() =>
    this._solicitudes().filter((s) => s.estado === 'aprobada')
  );

  readonly solicitudesRechazadas = computed(() =>
    this._solicitudes().filter((s) => s.estado === 'rechazada')
  );

  getById(id: string): SolicitudSocietaria | undefined {
    return this._solicitudes().find((s) => s.id === id);
  }

  getBySocioId(socioId: string): SolicitudSocietaria[] {
    return this._solicitudes().filter((s) => s.socioId === socioId);
  }

  crearSolicitud(datos: Omit<SolicitudSocietaria, 'id' | 'fechaUltimaAccion' | 'auditoria'>): void {
    const ahora = new Date().toISOString();
    const nueva: SolicitudSocietaria = {
      ...datos,
      id: crypto.randomUUID(),
      fechaUltimaAccion: datos.fechaCreacion,
      auditoria: [
        { accion: 'Creación de solicitud', usuario: datos.operador ?? 'Sistema', fechaHora: ahora },
      ],
    };
    this._solicitudes.update((list) => [...list, nueva]);
  }

  derivarParaEvaluacion(id: string, evaluador: string): void {
    const ahora = new Date().toISOString();
    this._solicitudes.update((list) =>
      list.map((s) =>
        s.id === id
          ? {
              ...s,
              estado: 'en_evaluacion' as EstadoSolicitud,
              evaluador,
              fechaUltimaAccion: ahora.split('T')[0],
              auditoria: [
                ...s.auditoria,
                { accion: 'Derivada a evaluación', usuario: evaluador, fechaHora: ahora },
              ],
            }
          : s
      )
    );
  }

  aprobar(id: string, aprobador: string, observacion?: string): void {
    const ahora = new Date().toISOString();
    this._solicitudes.update((list) =>
      list.map((s) =>
        s.id === id
          ? {
              ...s,
              estado: 'aprobada' as EstadoSolicitud,
              aprobador,
              fechaUltimaAccion: ahora.split('T')[0],
              auditoria: [
                ...s.auditoria,
                { accion: 'Aprobada', usuario: aprobador, fechaHora: ahora, observacion },
              ],
            }
          : s
      )
    );
  }

  rechazar(id: string, evaluador: string, motivo: string): void {
    const ahora = new Date().toISOString();
    this._solicitudes.update((list) =>
      list.map((s) =>
        s.id === id
          ? {
              ...s,
              estado: 'rechazada' as EstadoSolicitud,
              motivoRechazo: motivo,
              fechaUltimaAccion: ahora.split('T')[0],
              auditoria: [
                ...s.auditoria,
                { accion: 'Rechazada', usuario: evaluador, fechaHora: ahora, observacion: motivo },
              ],
            }
          : s
      )
    );
  }

  agregarObservacion(id: string, usuario: string, observacion: string): void {
    const ahora = new Date().toISOString();
    this._solicitudes.update((list) =>
      list.map((s) =>
        s.id === id
          ? {
              ...s,
              observaciones: observacion,
              fechaUltimaAccion: ahora.split('T')[0],
              auditoria: [
                ...s.auditoria,
                { accion: 'Observación agregada', usuario, fechaHora: ahora, observacion },
              ],
            }
          : s
      )
    );
  }
}
