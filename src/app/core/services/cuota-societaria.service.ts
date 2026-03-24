import { Injectable, signal, computed } from '@angular/core';
import { CuotaSocietaria, EstadoCuota, MetodoPago } from '../models/cuota-societaria.model';

const MOCK_CUOTAS: CuotaSocietaria[] = [
  // ── socio-1  Carlos García  (familiar · activo · S/ 200) ──────────────────
  { id: 'c-001', socioId: 'socio-1', periodo: '2025-10', monto: 200, estado: 'pagada', fechaVencimiento: '2025-10-31', fechaPago: '2025-10-10', metodoPago: 'transferencia', referenciaPago: 'TRF-1001', operadorPago: 'Recepción', generadoEn: '2025-10-01' },
  { id: 'c-002', socioId: 'socio-1', periodo: '2025-11', monto: 200, estado: 'pagada', fechaVencimiento: '2025-11-30', fechaPago: '2025-11-07', metodoPago: 'transferencia', referenciaPago: 'TRF-1102', operadorPago: 'Recepción', generadoEn: '2025-11-01' },
  { id: 'c-003', socioId: 'socio-1', periodo: '2025-12', monto: 200, estado: 'pagada', fechaVencimiento: '2025-12-31', fechaPago: '2025-12-12', metodoPago: 'tarjeta', operadorPago: 'Caja', generadoEn: '2025-12-01' },
  { id: 'c-004', socioId: 'socio-1', periodo: '2026-01', monto: 200, estado: 'pagada', fechaVencimiento: '2026-01-31', fechaPago: '2026-01-09', metodoPago: 'transferencia', referenciaPago: 'TRF-2601', operadorPago: 'Recepción', generadoEn: '2026-01-01' },
  { id: 'c-005', socioId: 'socio-1', periodo: '2026-02', monto: 200, estado: 'pagada', fechaVencimiento: '2026-02-28', fechaPago: '2026-02-06', metodoPago: 'transferencia', referenciaPago: 'TRF-2602', operadorPago: 'Recepción', generadoEn: '2026-02-01' },
  { id: 'c-006', socioId: 'socio-1', periodo: '2026-03', monto: 200, estado: 'pendiente', fechaVencimiento: '2026-03-31', generadoEn: '2026-03-01' },

  // ── socio-2  María López  (individual · activa · S/ 120) ──────────────────
  { id: 'c-007', socioId: 'socio-2', periodo: '2025-10', monto: 120, estado: 'pagada', fechaVencimiento: '2025-10-31', fechaPago: '2025-10-08', metodoPago: 'efectivo', operadorPago: 'Recepción', generadoEn: '2025-10-01' },
  { id: 'c-008', socioId: 'socio-2', periodo: '2025-11', monto: 120, estado: 'pagada', fechaVencimiento: '2025-11-30', fechaPago: '2025-11-05', metodoPago: 'efectivo', operadorPago: 'Recepción', generadoEn: '2025-11-01' },
  { id: 'c-009', socioId: 'socio-2', periodo: '2025-12', monto: 120, estado: 'pagada', fechaVencimiento: '2025-12-31', fechaPago: '2025-12-10', metodoPago: 'efectivo', operadorPago: 'Recepción', generadoEn: '2025-12-01' },
  { id: 'c-010', socioId: 'socio-2', periodo: '2026-01', monto: 120, estado: 'pagada', fechaVencimiento: '2026-01-31', fechaPago: '2026-01-11', metodoPago: 'transferencia', referenciaPago: 'TRF-2610', operadorPago: 'Caja', generadoEn: '2026-01-01' },
  { id: 'c-011', socioId: 'socio-2', periodo: '2026-02', monto: 120, estado: 'pagada', fechaVencimiento: '2026-02-28', fechaPago: '2026-02-09', metodoPago: 'efectivo', operadorPago: 'Recepción', generadoEn: '2026-02-01' },
  { id: 'c-012', socioId: 'socio-2', periodo: '2026-03', monto: 120, estado: 'pendiente', fechaVencimiento: '2026-03-31', generadoEn: '2026-03-01' },

  // ── socio-3  Roberto Martínez  (individual · suspendido · S/ 120) ──────────
  { id: 'c-013', socioId: 'socio-3', periodo: '2025-10', monto: 120, estado: 'pagada', fechaVencimiento: '2025-10-31', fechaPago: '2025-10-14', metodoPago: 'efectivo', operadorPago: 'Recepción', generadoEn: '2025-10-01' },
  { id: 'c-014', socioId: 'socio-3', periodo: '2025-11', monto: 120, estado: 'vencida', fechaVencimiento: '2025-11-30', generadoEn: '2025-11-01' },
  { id: 'c-015', socioId: 'socio-3', periodo: '2025-12', monto: 120, estado: 'vencida', fechaVencimiento: '2025-12-31', generadoEn: '2025-12-01' },
  { id: 'c-016', socioId: 'socio-3', periodo: '2026-01', monto: 120, estado: 'vencida', fechaVencimiento: '2026-01-31', generadoEn: '2026-01-01' },
  { id: 'c-017', socioId: 'socio-3', periodo: '2026-02', monto: 120, estado: 'vencida', fechaVencimiento: '2026-02-28', generadoEn: '2026-02-01' },
  { id: 'c-018', socioId: 'socio-3', periodo: '2026-03', monto: 120, estado: 'pendiente', fechaVencimiento: '2026-03-31', generadoEn: '2026-03-01' },

  // ── socio-4  Ana Fernández  (familiar · inactiva · S/ 200) ─────────────────
  { id: 'c-019', socioId: 'socio-4', periodo: '2025-10', monto: 200, estado: 'pagada', fechaVencimiento: '2025-10-31', fechaPago: '2025-10-12', metodoPago: 'tarjeta', operadorPago: 'Caja', generadoEn: '2025-10-01' },
  { id: 'c-020', socioId: 'socio-4', periodo: '2025-11', monto: 200, estado: 'pagada', fechaVencimiento: '2025-11-30', fechaPago: '2025-11-08', metodoPago: 'tarjeta', operadorPago: 'Caja', generadoEn: '2025-11-01' },
  { id: 'c-021', socioId: 'socio-4', periodo: '2025-12', monto: 200, estado: 'exonerada', fechaVencimiento: '2025-12-31', motivoExoneracion: 'Convenio institucional aprobado por directiva', generadoEn: '2025-12-01' },

  // ── socio-5  Luciana Torres  (transitorio_menor · activa · S/ 80) ──────────
  { id: 'c-022', socioId: 'socio-5', periodo: '2025-11', monto: 80, estado: 'pagada', fechaVencimiento: '2025-11-30', fechaPago: '2025-11-10', metodoPago: 'efectivo', operadorPago: 'Recepción', generadoEn: '2025-11-01' },
  { id: 'c-023', socioId: 'socio-5', periodo: '2025-12', monto: 80, estado: 'pagada', fechaVencimiento: '2025-12-31', fechaPago: '2025-12-09', metodoPago: 'efectivo', operadorPago: 'Recepción', generadoEn: '2025-12-01' },
  { id: 'c-024', socioId: 'socio-5', periodo: '2026-01', monto: 80, estado: 'pagada', fechaVencimiento: '2026-01-31', fechaPago: '2026-01-13', metodoPago: 'efectivo', operadorPago: 'Recepción', generadoEn: '2026-01-01' },
  { id: 'c-025', socioId: 'socio-5', periodo: '2026-02', monto: 80, estado: 'pagada', fechaVencimiento: '2026-02-28', fechaPago: '2026-02-10', metodoPago: 'efectivo', operadorPago: 'Recepción', generadoEn: '2026-02-01' },
  { id: 'c-026', socioId: 'socio-5', periodo: '2026-03', monto: 80, estado: 'pendiente', fechaVencimiento: '2026-03-31', generadoEn: '2026-03-01' },

  // ── socio-6  Diego Ramírez  (activo · S/ 120) ─────────────────────────────
  { id: 'c-027', socioId: 'socio-6', periodo: '2025-12', monto: 120, estado: 'pagada', fechaVencimiento: '2025-12-31', fechaPago: '2025-12-15', metodoPago: 'efectivo', operadorPago: 'Recepción', generadoEn: '2025-12-01' },
  { id: 'c-028', socioId: 'socio-6', periodo: '2026-01', monto: 120, estado: 'pagada', fechaVencimiento: '2026-01-31', fechaPago: '2026-01-08', metodoPago: 'efectivo', operadorPago: 'Recepción', generadoEn: '2026-01-01' },
  { id: 'c-029', socioId: 'socio-6', periodo: '2026-02', monto: 120, estado: 'pagada', fechaVencimiento: '2026-02-28', fechaPago: '2026-02-12', metodoPago: 'efectivo', operadorPago: 'Recepción', generadoEn: '2026-02-01' },
  { id: 'c-030', socioId: 'socio-6', periodo: '2026-03', monto: 120, estado: 'pendiente', fechaVencimiento: '2026-03-31', generadoEn: '2026-03-01' },

  // ── socio-7  Valentina Sánchez  (activa · S/ 120) ─────────────────────────
  { id: 'c-031', socioId: 'socio-7', periodo: '2025-12', monto: 120, estado: 'pagada', fechaVencimiento: '2025-12-31', fechaPago: '2025-12-11', metodoPago: 'transferencia', referenciaPago: 'TRF-7012', operadorPago: 'Recepción', generadoEn: '2025-12-01' },
  { id: 'c-032', socioId: 'socio-7', periodo: '2026-01', monto: 120, estado: 'pagada', fechaVencimiento: '2026-01-31', fechaPago: '2026-01-14', metodoPago: 'transferencia', referenciaPago: 'TRF-7101', operadorPago: 'Recepción', generadoEn: '2026-01-01' },
  { id: 'c-033', socioId: 'socio-7', periodo: '2026-02', monto: 120, estado: 'vencida', fechaVencimiento: '2026-02-28', generadoEn: '2026-02-01' },
  { id: 'c-034', socioId: 'socio-7', periodo: '2026-03', monto: 120, estado: 'pendiente', fechaVencimiento: '2026-03-31', generadoEn: '2026-03-01' },

  // ── socio-8  Matías Herrera  (activo · S/ 120) ────────────────────────────
  { id: 'c-035', socioId: 'socio-8', periodo: '2026-01', monto: 120, estado: 'pagada', fechaVencimiento: '2026-01-31', fechaPago: '2026-01-10', metodoPago: 'tarjeta', operadorPago: 'Caja', generadoEn: '2026-01-01' },
  { id: 'c-036', socioId: 'socio-8', periodo: '2026-02', monto: 120, estado: 'pagada', fechaVencimiento: '2026-02-28', fechaPago: '2026-02-07', metodoPago: 'tarjeta', operadorPago: 'Caja', generadoEn: '2026-02-01' },
  { id: 'c-037', socioId: 'socio-8', periodo: '2026-03', monto: 120, estado: 'pagada', fechaVencimiento: '2026-03-31', fechaPago: '2026-03-05', metodoPago: 'tarjeta', operadorPago: 'Caja', generadoEn: '2026-03-01' },

  // ── socio-9  Sofía Morales  (activa · S/ 120) ─────────────────────────────
  { id: 'c-038', socioId: 'socio-9', periodo: '2026-01', monto: 120, estado: 'pagada', fechaVencimiento: '2026-01-31', fechaPago: '2026-01-09', metodoPago: 'transferencia', referenciaPago: 'TRF-9001', operadorPago: 'Recepción', generadoEn: '2026-01-01' },
  { id: 'c-039', socioId: 'socio-9', periodo: '2026-02', monto: 120, estado: 'pagada', fechaVencimiento: '2026-02-28', fechaPago: '2026-02-11', metodoPago: 'transferencia', referenciaPago: 'TRF-9002', operadorPago: 'Recepción', generadoEn: '2026-02-01' },
  { id: 'c-040', socioId: 'socio-9', periodo: '2026-03', monto: 120, estado: 'pendiente', fechaVencimiento: '2026-03-31', generadoEn: '2026-03-01' },

  // ── socio-10  Joaquín Álvarez  (activo · S/ 120) ──────────────────────────
  { id: 'c-041', socioId: 'socio-10', periodo: '2026-02', monto: 120, estado: 'pagada', fechaVencimiento: '2026-02-28', fechaPago: '2026-02-13', metodoPago: 'efectivo', operadorPago: 'Recepción', generadoEn: '2026-02-01' },
  { id: 'c-042', socioId: 'socio-10', periodo: '2026-03', monto: 120, estado: 'pendiente', fechaVencimiento: '2026-03-31', generadoEn: '2026-03-01' },

  // ── socio-11  Camila Ruiz  (suspendida · S/ 120) ──────────────────────────
  { id: 'c-043', socioId: 'socio-11', periodo: '2025-12', monto: 120, estado: 'pagada', fechaVencimiento: '2025-12-31', fechaPago: '2025-12-08', metodoPago: 'efectivo', operadorPago: 'Recepción', generadoEn: '2025-12-01' },
  { id: 'c-044', socioId: 'socio-11', periodo: '2026-01', monto: 120, estado: 'vencida', fechaVencimiento: '2026-01-31', generadoEn: '2026-01-01' },
  { id: 'c-045', socioId: 'socio-11', periodo: '2026-02', monto: 120, estado: 'vencida', fechaVencimiento: '2026-02-28', generadoEn: '2026-02-01' },
  { id: 'c-046', socioId: 'socio-11', periodo: '2026-03', monto: 120, estado: 'pendiente', fechaVencimiento: '2026-03-31', generadoEn: '2026-03-01' },

  // ── socio-12  Tomás Pérez  (activo · S/ 120) ──────────────────────────────
  { id: 'c-047', socioId: 'socio-12', periodo: '2026-03', monto: 120, estado: 'pendiente', fechaVencimiento: '2026-03-31', generadoEn: '2026-03-01' },

  // ── socio-13  Isabella Gutiérrez  (activa · S/ 120) ───────────────────────
  { id: 'c-048', socioId: 'socio-13', periodo: '2026-03', monto: 120, estado: 'pendiente', fechaVencimiento: '2026-03-31', generadoEn: '2026-03-01' },

  // ── socio-14  Nicolás Castro  (inactivo desde 2025-01-31 · S/ 120) ─────────
  { id: 'c-049', socioId: 'socio-14', periodo: '2025-10', monto: 120, estado: 'pagada', fechaVencimiento: '2025-10-31', fechaPago: '2025-10-09', metodoPago: 'efectivo', operadorPago: 'Recepción', generadoEn: '2025-10-01' },
  { id: 'c-050', socioId: 'socio-14', periodo: '2025-11', monto: 120, estado: 'vencida', fechaVencimiento: '2025-11-30', generadoEn: '2025-11-01' },

  // ── dep-2  Lucas Sebastián García Montoya  (hijo de socio-1 · S/ 80) ──────
  { id: 'c-051', socioId: 'dep-2', periodo: '2026-01', monto: 80, estado: 'pagada', fechaVencimiento: '2026-01-31', fechaPago: '2026-01-09', metodoPago: 'efectivo', operadorPago: 'Recepción', generadoEn: '2026-01-01' },
  { id: 'c-052', socioId: 'dep-2', periodo: '2026-02', monto: 80, estado: 'pagada', fechaVencimiento: '2026-02-28', fechaPago: '2026-02-06', metodoPago: 'efectivo', operadorPago: 'Recepción', generadoEn: '2026-02-01' },
  { id: 'c-053', socioId: 'dep-2', periodo: '2026-03', monto: 80, estado: 'pendiente', fechaVencimiento: '2026-03-31', generadoEn: '2026-03-01' },

  // ── dep-3  Sofía Valentina García Montoya  (hija de socio-1 · S/ 80) ───────
  { id: 'c-054', socioId: 'dep-3', periodo: '2026-02', monto: 80, estado: 'pagada', fechaVencimiento: '2026-02-28', fechaPago: '2026-02-06', metodoPago: 'efectivo', operadorPago: 'Recepción', generadoEn: '2026-02-01' },
  { id: 'c-055', socioId: 'dep-3', periodo: '2026-03', monto: 80, estado: 'pendiente', fechaVencimiento: '2026-03-31', generadoEn: '2026-03-01' },

  // ── dep-5  Martín Ignacio Fernández Quispe  (hijo de socio-4 · S/ 80) ──────
  { id: 'c-056', socioId: 'dep-5', periodo: '2025-10', monto: 80, estado: 'pagada', fechaVencimiento: '2025-10-31', fechaPago: '2025-10-12', metodoPago: 'efectivo', operadorPago: 'Recepción', generadoEn: '2025-10-01' },
  { id: 'c-057', socioId: 'dep-5', periodo: '2025-11', monto: 80, estado: 'vencida', fechaVencimiento: '2025-11-30', generadoEn: '2025-11-01' },

  // ── dep-6  Clara Sofía Fernández Quispe  (hija de socio-4 · exonerada por discapacidad) ─
  { id: 'c-058', socioId: 'dep-6', periodo: '2025-10', monto: 80, estado: 'exonerada', fechaVencimiento: '2025-10-31', motivoExoneracion: 'Exoneración por discapacidad (CONADIS CN-00182)', generadoEn: '2025-10-01' },
];

@Injectable({ providedIn: 'root' })
export class CuotaSocietariaService {
  private readonly _cuotas = signal<CuotaSocietaria[]>(MOCK_CUOTAS);

  readonly cuotas = this._cuotas.asReadonly();

  readonly cuotasPendientes = computed(() => this._cuotas().filter((c) => c.estado === 'pendiente'));
  readonly cuotasVencidas = computed(() => this._cuotas().filter((c) => c.estado === 'vencida'));
  readonly cuotasPagadas = computed(() => this._cuotas().filter((c) => c.estado === 'pagada'));

  getBySocioId(socioId: string): CuotaSocietaria[] {
    return this._cuotas().filter((c) => c.socioId === socioId);
  }

  getByPeriodo(periodo: string): CuotaSocietaria[] {
    return this._cuotas().filter((c) => c.periodo === periodo);
  }

  getById(id: string): CuotaSocietaria | undefined {
    return this._cuotas().find((c) => c.id === id);
  }

  /** Genera cuotas para todos los socios de un período (si no existen aún) */
  generarPeriodo(socioIds: string[], periodo: string, monto: number, fechaVencimiento: string): void {
    const existentes = new Set(this._cuotas().filter((c) => c.periodo === periodo).map((c) => c.socioId));
    const nuevas: CuotaSocietaria[] = socioIds
      .filter((id) => !existentes.has(id))
      .map((id, i) => ({
        id: `c-gen-${periodo}-${i}`,
        socioId: id,
        periodo,
        monto,
        estado: 'pendiente' as EstadoCuota,
        fechaVencimiento,
        generadoEn: new Date().toISOString().split('T')[0],
      }));
    if (nuevas.length > 0) {
      this._cuotas.update((cs) => [...cs, ...nuevas]);
    }
  }

  registrarPago(id: string, pago: { metodoPago: MetodoPago; referenciaPago?: string; operadorPago?: string }): void {
    this._cuotas.update((cs) =>
      cs.map((c) =>
        c.id === id
          ? {
              ...c,
              estado: 'pagada' as EstadoCuota,
              fechaPago: new Date().toISOString().split('T')[0],
              metodoPago: pago.metodoPago,
              referenciaPago: pago.referenciaPago,
              operadorPago: pago.operadorPago,
            }
          : c
      )
    );
  }

  exonerar(id: string, motivo: string): void {
    this._cuotas.update((cs) =>
      cs.map((c) =>
        c.id === id ? { ...c, estado: 'exonerada' as EstadoCuota, motivoExoneracion: motivo } : c
      )
    );
  }

  /** Marca como vencidas las cuotas pendientes con fecha de vencimiento pasada */
  actualizarVencidas(): void {
    const hoy = new Date().toISOString().split('T')[0];
    this._cuotas.update((cs) =>
      cs.map((c) =>
        c.estado === 'pendiente' && c.fechaVencimiento < hoy
          ? { ...c, estado: 'vencida' as EstadoCuota }
          : c
      )
    );
  }
}
