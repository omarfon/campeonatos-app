import { Injectable, signal, computed } from '@angular/core';
import {
  Recuperacion,
  EstadoRecuperacion,
  MotivoRecuperacion,
} from '../models/recuperacion.model';

// ──── Mock Data ────────────────────────────────────────────────

const MOCK_RECUPERACIONES: Recuperacion[] = [
  {
    id: 'rec-001',
    matriculaId: 'mat-new-1',
    socioId: 'socio-1',
    nombreSocio: 'García, Carlos',
    disciplina: 'Natación',
    nivel: 'Principiante',
    claseOriginalId: 'cls-nat-ninos-prin',
    nombreClaseOriginal: 'Natación Niños — Principiante (Lun/Mié/Vie 09:00)',
    fechaSesionOriginal: '2026-03-10',
    motivo: 'salud',
    documentoJustificante: 'Certificado médico Dr. Pérez — 10/03/2026',
    comentario: 'El alumno presentó cuadro febril. El apoderado entregó certificado médico firmado.',
    estado: 'en_evaluacion',
    aforoComodinDescontado: false,
    diferida: false,
    registradoPor: 'operador-caja',
    fechaRegistro: '2026-03-11',
  },
  {
    id: 'rec-002',
    matriculaId: 'mat-new-3',
    socioId: 'socio-1',
    nombreSocio: 'García, Carlos',
    disciplina: 'Karate',
    nivel: 'Blanco',
    claseOriginalId: 'cls-kar-ninos-blanc',
    nombreClaseOriginal: 'Karate Niños — Blanco (Mar/Jue 10:00)',
    fechaSesionOriginal: '2026-03-04',
    motivo: 'laboral',
    documentoJustificante: 'Carta del empleador confirmando capacitación obligatoria el 04/03/2026',
    comentario: 'Documentación laboral válida presentada por el apoderado.',
    estado: 'aprobada',
    evaluadoPor: 'admin',
    fechaEvaluacion: '2026-03-06',
    aforoComodinDescontado: false,
    diferida: false,
    registradoPor: 'operador-caja',
    fechaRegistro: '2026-03-05',
  },
  {
    id: 'rec-003',
    matriculaId: 'mat-new-2',
    socioId: 'socio-2',
    nombreSocio: 'López, Ana',
    disciplina: 'Karate',
    nivel: 'Blanco',
    claseOriginalId: 'cls-kar-ninos-blanc',
    nombreClaseOriginal: 'Karate Niños — Blanco (Mar/Jue 10:00)',
    fechaSesionOriginal: '2026-03-25',
    motivo: 'viaje_salud',
    documentoJustificante: 'Historial clínico y pasajes por tratamiento médico fuera de Lima',
    comentario:
      'Alumna viajó a provincia por tratamiento médico. Última semana del mes, sin fechas disponibles para recuperar en el ciclo actual.',
    estado: 'diferida',
    evaluadoPor: 'admin',
    fechaEvaluacion: '2026-03-20',
    aforoComodinDescontado: false,
    diferida: true,
    notaCreditoId: 'nc-001',
    registradoPor: 'operador-caja',
    fechaRegistro: '2026-03-19',
  },
];

// ──── Servicio ─────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class RecuperacionService {
  private readonly _recuperaciones = signal<Recuperacion[]>(MOCK_RECUPERACIONES);

  readonly recuperaciones = this._recuperaciones.asReadonly();

  readonly pendientesEvaluacion = computed(() =>
    this._recuperaciones().filter(
      (r) => r.estado === 'pendiente_documentos' || r.estado === 'en_evaluacion',
    ),
  );

  readonly aprobadas = computed(() =>
    this._recuperaciones().filter((r) => r.estado === 'aprobada'),
  );

  getById(id: string): Recuperacion | undefined {
    return this._recuperaciones().find((r) => r.id === id);
  }

  create(data: Omit<Recuperacion, 'id' | 'fechaRegistro'>): Recuperacion {
    const nueva: Recuperacion = {
      ...data,
      id: `rec-${Date.now()}`,
      fechaRegistro: new Date().toISOString().slice(0, 10),
    };
    this._recuperaciones.update((list) => [...list, nueva]);
    return nueva;
  }

  /** Aprueba la solicitud. Si se proporciona una clase, la ejecuta directamente. */
  aprobar(
    id: string,
    evaluadoPor: string,
    claseRecuperacionId?: string,
    nombreClaseRecuperacion?: string,
    fechaRecuperacion?: string,
  ): void {
    const estado: EstadoRecuperacion = claseRecuperacionId ? 'ejecutada' : 'aprobada';
    this._recuperaciones.update((list) =>
      list.map((r) =>
        r.id === id
          ? {
              ...r,
              estado,
              evaluadoPor,
              fechaEvaluacion: new Date().toISOString().slice(0, 10),
              claseRecuperacionId,
              nombreClaseRecuperacion,
              fechaRecuperacion,
              aforoComodinDescontado: !!claseRecuperacionId,
            }
          : r,
      ),
    );
  }

  rechazar(id: string, evaluadoPor: string, motivoRechazo: string): void {
    this._recuperaciones.update((list) =>
      list.map((r) =>
        r.id === id
          ? {
              ...r,
              estado: 'rechazada' as EstadoRecuperacion,
              evaluadoPor,
              fechaEvaluacion: new Date().toISOString().slice(0, 10),
              motivoRechazo,
            }
          : r,
      ),
    );
  }

  /** Difiere la recuperación al mes siguiente y vincula la Nota de Crédito emitida. */
  diferir(id: string, evaluadoPor: string, notaCreditoId: string): void {
    this._recuperaciones.update((list) =>
      list.map((r) =>
        r.id === id
          ? {
              ...r,
              estado: 'diferida' as EstadoRecuperacion,
              evaluadoPor,
              fechaEvaluacion: new Date().toISOString().slice(0, 10),
              diferida: true,
              notaCreditoId,
            }
          : r,
      ),
    );
  }
}
