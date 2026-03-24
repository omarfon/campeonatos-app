import { Injectable, signal, computed, inject } from '@angular/core';
import {
  Retiro,
  CalculoRetiro,
  ConfiguracionGastoAdmin,
  DEFAULT_GASTO_ADMIN,
  FormaDevolucion,
  TipoRetiro,
  ResponsabilidadRetiro,
} from '../models/retiro.model';
import { NotaCreditoService } from './nota-credito.service';

// ──── Mock Data ────────────────────────────────────────────────

const MOCK_RETIROS: Retiro[] = [
  {
    id: 'ret-001',
    matriculaId: 'mat-new-2',
    socioId: 'socio-2',
    nombreSocio: 'López, Ana',
    cursoNombre: 'Karate Infantil',
    claseNombre: 'Karate Niños — Blanco (Mar/Jue 10:00)',
    tipo: 'parcial',
    responsabilidad: 'cliente',
    motivoRetiro: 'La familia indicó que la alumna ya no puede asistir por cambio de horario escolar.',
    calculo: {
      totalSesiones: 16,
      sesionesAsistidas: 4,
      sesionesPendientes: 12,
      costoTotalPagado: 108,
      costoPorSesion: 6.75,
      costoSesionesAsistidas: 27,
      saldoSesionesPendientes: 81,
      aplicaGastoAdministrativo: true,
      gastoAdministrativo: 15,
      montoNotaCredito: 66,
    },
    notaCreditoId: 'nc-002',
    formaDevolucion: 'nota_credito',
    impactoLiquidacionDocente: true,
    estado: 'procesado',
    procesadoPor: 'admin',
    fechaProcesamiento: '2026-03-08',
  },
];

// ──── Servicio ─────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class RetiroService {
  private readonly notaCreditoService = inject(NotaCreditoService);

  private readonly _retiros = signal<Retiro[]>(MOCK_RETIROS);
  private _configGastoAdmin: ConfiguracionGastoAdmin = { ...DEFAULT_GASTO_ADMIN };

  readonly retiros = this._retiros.asReadonly();

  readonly totalProcesados = computed(
    () => this._retiros().filter((r) => r.estado === 'procesado').length,
  );

  get configGastoAdmin(): ConfiguracionGastoAdmin {
    return { ...this._configGastoAdmin };
  }

  updateConfigGastoAdmin(config: ConfiguracionGastoAdmin): void {
    this._configGastoAdmin = { ...config };
  }

  getById(id: string): Retiro | undefined {
    return this._retiros().find((r) => r.id === id);
  }

  /**
   * Calcula el prorrateo de clases y el monto de la Nota de Crédito.
   * Si responsabilidad === 'institucion', no se cobra gasto administrativo.
   */
  calcular(params: {
    costoTotalPagado: number;
    totalSesiones: number;
    sesionesAsistidas: number;
    responsabilidad: ResponsabilidadRetiro;
  }): CalculoRetiro {
    const { costoTotalPagado, totalSesiones, sesionesAsistidas, responsabilidad } = params;
    const sesionesPendientes = Math.max(totalSesiones - sesionesAsistidas, 0);
    const costoPorSesion =
      totalSesiones > 0
        ? Number((costoTotalPagado / totalSesiones).toFixed(2))
        : 0;
    const costoSesionesAsistidas = Number((costoPorSesion * sesionesAsistidas).toFixed(2));
    const saldoSesionesPendientes = Number(
      (costoTotalPagado - costoSesionesAsistidas).toFixed(2),
    );

    const aplicaGastoAdministrativo =
      responsabilidad === 'cliente' && sesionesPendientes > 0;

    let gastoAdministrativo = 0;
    if (aplicaGastoAdministrativo) {
      if (this._configGastoAdmin.tipo === 'monto_fijo') {
        gastoAdministrativo = this._configGastoAdmin.valor;
      } else {
        gastoAdministrativo = Number(
          ((saldoSesionesPendientes * this._configGastoAdmin.valor) / 100).toFixed(2),
        );
      }
    }

    const montoNotaCredito = Number(
      Math.max(saldoSesionesPendientes - gastoAdministrativo, 0).toFixed(2),
    );

    return {
      totalSesiones,
      sesionesAsistidas,
      sesionesPendientes,
      costoTotalPagado,
      costoPorSesion,
      costoSesionesAsistidas,
      saldoSesionesPendientes,
      aplicaGastoAdministrativo,
      gastoAdministrativo,
      montoNotaCredito,
    };
  }

  /** Procesa el retiro y genera automáticamente la Nota de Crédito si corresponde. */
  procesar(data: {
    matriculaId: string;
    socioId: string;
    nombreSocio: string;
    cursoNombre: string;
    claseNombre: string;
    responsabilidad: ResponsabilidadRetiro;
    motivoRetiro: string;
    documentoJustificante?: string;
    calculo: CalculoRetiro;
    formaDevolucion: FormaDevolucion;
    observaciones?: string;
  }): Retiro {
    const tipo: TipoRetiro = data.calculo.sesionesAsistidas === 0 ? 'total' : 'parcial';

    let notaCreditoId: string | undefined;
    if (data.calculo.montoNotaCredito > 0) {
      const nc = this.notaCreditoService.crear({
        socioId: data.socioId,
        nombreSocio: data.nombreSocio,
        origen: tipo === 'total' ? 'anulacion_total' : 'retiro_parcial',
        origenId: `ret-${Date.now()}`,
        descripcionOrigen: `${tipo === 'total' ? 'Anulación Total' : 'Retiro Parcial'} — ${data.cursoNombre}`,
        monto: data.calculo.montoNotaCredito,
        observaciones: data.observaciones,
      });
      notaCreditoId = nc.id;
    }

    const retiro: Retiro = {
      id: `ret-${Date.now()}`,
      ...data,
      tipo,
      notaCreditoId,
      impactoLiquidacionDocente: data.calculo.montoNotaCredito > 0,
      estado: 'procesado',
      procesadoPor: 'admin',
      fechaProcesamiento: new Date().toISOString().slice(0, 10),
    };

    this._retiros.update((list) => [...list, retiro]);
    return retiro;
  }
}
