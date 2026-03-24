import { Injectable, computed, inject, signal } from '@angular/core';
import {
  CarnetAcceso,
  RegistroAcceso,
  PenalidadAcceso,
  ConfiguracionAcceso,
  ResultadoAcceso,
  TipoAcceso,
  EstadoPenalidad,
} from '../models/acceso.model';
import { AcademiaService } from './academia.service';
import { AcademiaMatriculaService } from './academia-matricula.service';
import { SocioService } from './socio.service';

// ──── Mock: Configuración ────

const MOCK_CONFIG: ConfiguracionAcceso = {
  toleranciaIngresoMinutos: 30,
  toleranciaSalidaMinutos: 60,
  montoMultaPorHoraFraccion: 15,
  aplicarANoSocios: true,
  aplicarASocios: false,
};

// ──── Mock: Carnets ────

const MOCK_CARNETS: CarnetAcceso[] = [
  {
    id: 'car-1',
    socioId: 'socio-1',
    codigoCarnet: 'ACE-2026-001',
    claseIds: ['cls-nat-ninos-prin'],
    condicion: 'socio',
    estado: 'activo',
    emitidoEn: '2026-03-01',
  },
  {
    id: 'car-2',
    socioId: 'socio-2',
    codigoCarnet: 'ACE-2026-002',
    claseIds: ['cls-kar-ninos-blanc'],
    condicion: 'no_socio',
    estado: 'activo',
    emitidoEn: '2026-03-02',
  },
  {
    id: 'car-3',
    socioId: 'socio-3',
    codigoCarnet: 'ACE-2026-003',
    claseIds: ['cls-nat-ninos-prin'],
    condicion: 'dependiente',
    estado: 'activo',
    emitidoEn: '2026-03-05',
  },
  {
    id: 'car-4',
    socioId: 'socio-4',
    codigoCarnet: 'ACE-2026-004',
    claseIds: ['cls-kar-ninos-blanc'],
    condicion: 'no_socio',
    estado: 'bloqueado',
    emitidoEn: '2026-03-06',
  },
];

// ──── Mock: Registros de Acceso ────

const MOCK_REGISTROS: RegistroAcceso[] = [
  {
    id: 'acc-1',
    carnetId: 'car-1',
    socioId: 'socio-1',
    claseId: 'cls-nat-ninos-prin',
    tipo: 'ingreso',
    fechaHora: '2026-03-22T07:35:00',
    resultado: 'permitido',
    registradoPor: 'Luis García',
  },
  {
    id: 'acc-2',
    carnetId: 'car-1',
    socioId: 'socio-1',
    claseId: 'cls-nat-ninos-prin',
    tipo: 'salida',
    fechaHora: '2026-03-22T10:15:00',
    resultado: 'alerta_tiempo',
    motivoBloqueo: 'Excedió 60 min de tolerancia post-clase (75 min extra)',
    derivadoPenalidad: true,
    registradoPor: 'Luis García',
  },
  {
    id: 'acc-3',
    carnetId: 'car-2',
    socioId: 'socio-2',
    claseId: 'cls-kar-ninos-blanc',
    tipo: 'ingreso',
    fechaHora: '2026-03-22T09:45:00',
    resultado: 'permitido',
    registradoPor: 'Luis García',
  },
  {
    id: 'acc-4',
    carnetId: 'car-4',
    socioId: 'socio-4',
    claseId: 'cls-kar-ninos-blanc',
    tipo: 'ingreso',
    fechaHora: '2026-03-22T09:50:00',
    resultado: 'bloqueado',
    motivoBloqueo: 'Carnet bloqueado por penalidad pendiente',
    registradoPor: 'Luis García',
  },
];

// ──── Mock: Penalidades ────

const MOCK_PENALIDADES: PenalidadAcceso[] = [
  {
    id: 'pen-1',
    registroAccesoId: 'acc-2',
    socioId: 'socio-1',
    minutosExcedidos: 75,
    montoCalculado: 30,
    estado: 'pendiente',
    observaciones: 'Salida registrada a las 10:15, clase terminó a las 09:00.',
    fechaRegistro: '2026-03-22T10:15:00',
  },
];

@Injectable({ providedIn: 'root' })
export class AccesoService {
  private readonly academiaService = inject(AcademiaService);
  private readonly matriculaService = inject(AcademiaMatriculaService);
  private readonly socioService = inject(SocioService);

  private readonly _config = signal<ConfiguracionAcceso>(MOCK_CONFIG);
  private readonly _carnets = signal<CarnetAcceso[]>(MOCK_CARNETS);
  private readonly _registros = signal<RegistroAcceso[]>(MOCK_REGISTROS);
  private readonly _penalidades = signal<PenalidadAcceso[]>(MOCK_PENALIDADES);

  readonly config = this._config.asReadonly();
  readonly carnets = this._carnets.asReadonly();
  readonly registros = this._registros.asReadonly();
  readonly penalidades = this._penalidades.asReadonly();

  readonly carnetsDetallados = computed(() =>
    this._carnets().map((c) => {
      const socio = this.socioService.getById(c.socioId);
      const pensPendientes = this._penalidades().filter(
        (p) => p.socioId === c.socioId && p.estado === 'pendiente'
      ).length;
      return {
        ...c,
        socioNombre: socio ? `${socio.apellido}, ${socio.nombre}` : '—',
        socioDni: socio?.dni ?? '—',
        penalidades: pensPendientes,
      };
    })
  );

  readonly registrosDetallados = computed(() =>
    this._registros()
      .map((r) => {
        const socio = this.socioService.getById(r.socioId);
        const clase = r.claseId ? this.academiaService.getClaseById(r.claseId) : undefined;
        const curso = clase ? this.academiaService.getCursoById(clase.cursoId) : undefined;
        return {
          ...r,
          socioNombre: socio ? `${socio.apellido}, ${socio.nombre}` : '—',
          cursoNombre: curso?.nombre ?? '—',
        };
      })
      .sort((a, b) => b.fechaHora.localeCompare(a.fechaHora))
  );

  readonly penalidadesDetalladas = computed(() =>
    this._penalidades().map((p) => {
      const socio = this.socioService.getById(p.socioId);
      return {
        ...p,
        socioNombre: socio ? `${socio.apellido}, ${socio.nombre}` : '—',
        socioDni: socio?.dni ?? '—',
      };
    }).sort((a, b) => b.fechaRegistro.localeCompare(a.fechaRegistro))
  );

  readonly kpis = computed(() => ({
    totalCarnets: this._carnets().length,
    carnetsActivos: this._carnets().filter((c) => c.estado === 'activo').length,
    accesosHoy: this._registros().filter((r) => r.fechaHora.startsWith('2026-03-22')).length,
    bloqueadosHoy: this._registros().filter(
      (r) => r.fechaHora.startsWith('2026-03-22') && r.resultado === 'bloqueado'
    ).length,
    penalidadesPendientes: this._penalidades().filter((p) => p.estado === 'pendiente').length,
    montoPendiente: this._penalidades()
      .filter((p) => p.estado === 'pendiente')
      .reduce((acc, p) => acc + p.montoCalculado, 0),
  }));

  // ──── Carnets CRUD ────

  emitirCarnet(carnet: Omit<CarnetAcceso, 'id'>): CarnetAcceso {
    const nuevo: CarnetAcceso = { ...carnet, id: `car-${Date.now()}` };
    this._carnets.update((prev) => [...prev, nuevo]);
    return nuevo;
  }

  getCarnetBySocio(socioId: string): CarnetAcceso | undefined {
    return this._carnets().find((c) => c.socioId === socioId && c.estado === 'activo');
  }

  getCarnetById(id: string): CarnetAcceso | undefined {
    return this._carnets().find((c) => c.id === id);
  }

  cambiarEstadoCarnet(id: string, estado: CarnetAcceso['estado']): void {
    this._carnets.update((prev) =>
      prev.map((c) => (c.id === id ? { ...c, estado } : c))
    );
  }

  // ──── Validación de Acceso ────

  /**
   * Simula el escaneo del carnet en el molinete.
   * Retorna el resultado del acceso y registra el movimiento.
   */
  simularAcceso(
    codigoCarnet: string,
    tipo: TipoAcceso,
    fechaHora: string,
    registradoPor: string
  ): {
    resultado: ResultadoAcceso;
    motivo?: string;
    socioNombre?: string;
    cursoNombre?: string;
    derivadoPenalidad?: boolean;
  } {
    const carnet = this._carnets().find((c) => c.codigoCarnet === codigoCarnet);
    if (!carnet) {
      return { resultado: 'bloqueado', motivo: 'Carnet no reconocido en el sistema.' };
    }
    if (carnet.estado !== 'activo') {
      return { resultado: 'bloqueado', motivo: `Carnet ${carnet.estado}. Diríjase a secretaría.` };
    }

    // Verificar penalidades pendientes → bloquear ingreso
    const penalidadesPendientes = this._penalidades().filter(
      (p) => p.socioId === carnet.socioId && p.estado === 'pendiente'
    );
    if (penalidadesPendientes.length > 0 && tipo === 'ingreso') {
      return {
        resultado: 'bloqueado',
        motivo: `Tiene ${penalidadesPendientes.length} penalidad(es) pendiente(s) de pago.`,
      };
    }

    const socio = this.socioService.getById(carnet.socioId);
    const config = this._config();

    // Socios tienen libre circulación sin restricción de tiempo
    if (socio?.condicionInstitucional === 'socio' && !config.aplicarASocios) {
      const claseId = carnet.claseIds[0];
      const clase = claseId ? this.academiaService.getClaseById(claseId) : undefined;
      const curso = clase ? this.academiaService.getCursoById(clase.cursoId) : undefined;
      this._registrarAcceso(carnet, tipo, fechaHora, 'permitido', undefined, registradoPor);
      return {
        resultado: 'permitido',
        socioNombre: socio ? `${socio.nombre} ${socio.apellido}` : undefined,
        cursoNombre: curso?.nombre,
      };
    }

    // Buscar clase activa del día
    const diaHora = fechaHora.substring(11, 16); // HH:MM
    const fechaSolo = fechaHora.substring(0, 10); // YYYY-MM-DD
    const clasesDelDia = carnet.claseIds
      .map((id) => this.academiaService.getClaseById(id))
      .filter((c): c is NonNullable<typeof c> => c !== undefined)
      .filter((c) => {
        const fechaDate = new Date(fechaSolo + 'T00:00:00');
        const diaSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][
          fechaDate.getDay()
        ];
        return c.horarios.some((h) => h.dia === diaSemana);
      });

    if (clasesDelDia.length === 0) {
      this._registrarAcceso(carnet, tipo, fechaHora, 'bloqueado', 'No tiene clase programada hoy.', registradoPor);
      return { resultado: 'bloqueado', motivo: 'No tiene clase programada hoy.' };
    }

    const claseActiva = clasesDelDia[0];
    const horario = claseActiva.horarios[0];
    const minutosAntes = this._diffMinutos(diaHora, horario.horaInicio);
    const minutosDespues = this._diffMinutos(horario.horaFin, diaHora);
    const curso = this.academiaService.getCursoById(claseActiva.cursoId);

    if (tipo === 'ingreso') {
      // Permite si está dentro del rango: hasta 30 min antes del inicio hasta el fin de clase
      if (minutosAntes > config.toleranciaIngresoMinutos) {
        const motivo = `Demasiado temprano. Su clase inicia a las ${horario.horaInicio}.`;
        this._registrarAcceso(carnet, tipo, fechaHora, 'bloqueado', motivo, registradoPor);
        return { resultado: 'bloqueado', motivo };
      }
      if (minutosDespues < 0) {
        const motivo = `Su clase terminó hace ${Math.abs(minutosDespues)} min.`;
        this._registrarAcceso(carnet, tipo, fechaHora, 'bloqueado', motivo, registradoPor);
        return { resultado: 'bloqueado', motivo };
      }
      this._registrarAcceso(carnet, tipo, fechaHora, 'permitido', undefined, registradoPor, claseActiva.id);
      return {
        resultado: 'permitido',
        socioNombre: socio ? `${socio.nombre} ${socio.apellido}` : undefined,
        cursoNombre: curso?.nombre,
      };
    } else {
      // Salida: verificar tolerancia post-clase
      if (minutosDespues > config.toleranciaSalidaMinutos) {
        const minutosExtra = minutosDespues - config.toleranciaSalidaMinutos;
        const horas = Math.ceil(minutosExtra / 60);
        const monto = horas * config.montoMultaPorHoraFraccion;
        const motivo = `Excedió ${minutosExtra} minutos de tolerancia. Penalidad: S/ ${monto}.`;
        const registroId = this._registrarAcceso(
          carnet, tipo, fechaHora, 'alerta_tiempo', motivo, registradoPor, claseActiva.id, true
        );
        // Crear penalidad automáticamente
        this._penalidades.update((prev) => [
          ...prev,
          {
            id: `pen-${Date.now()}`,
            registroAccesoId: registroId,
            socioId: carnet.socioId,
            minutosExcedidos: minutosExtra,
            montoCalculado: monto,
            estado: 'pendiente',
            fechaRegistro: fechaHora,
          },
        ]);
        return {
          resultado: 'alerta_tiempo',
          motivo,
          derivadoPenalidad: true,
          socioNombre: socio ? `${socio.nombre} ${socio.apellido}` : undefined,
          cursoNombre: curso?.nombre,
        };
      }
      this._registrarAcceso(carnet, tipo, fechaHora, 'permitido', undefined, registradoPor, claseActiva.id);
      return {
        resultado: 'permitido',
        socioNombre: socio ? `${socio.nombre} ${socio.apellido}` : undefined,
        cursoNombre: curso?.nombre,
      };
    }
  }

  private _registrarAcceso(
    carnet: CarnetAcceso,
    tipo: TipoAcceso,
    fechaHora: string,
    resultado: ResultadoAcceso,
    motivoBloqueo?: string,
    registradoPor?: string,
    claseId?: string,
    derivadoPenalidad?: boolean
  ): string {
    const id = `acc-${Date.now()}`;
    this._registros.update((prev) => [
      {
        id,
        carnetId: carnet.id,
        socioId: carnet.socioId,
        claseId,
        tipo,
        fechaHora,
        resultado,
        motivoBloqueo,
        derivadoPenalidad,
        registradoPor,
      },
      ...prev,
    ]);
    return id;
  }

  // ──── Penalidades ────

  resolverPenalidad(id: string, estado: 'pagada' | 'exonerada', motivoExoneracion?: string): void {
    this._penalidades.update((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, estado, motivoExoneracion, fechaResolucion: new Date().toISOString() }
          : p
      )
    );
    // Si se resuelve la penalidad, desbloquear carnet si estaba bloqueado por eso
    if (estado === 'pagada' || estado === 'exonerada') {
      const pen = this._penalidades().find((p) => p.id === id);
      if (pen) {
        const otrasPendientes = this._penalidades().filter(
          (p) => p.socioId === pen.socioId && p.estado === 'pendiente' && p.id !== id
        );
        if (otrasPendientes.length === 0) {
          const carnet = this._carnets().find((c) => c.socioId === pen.socioId && c.estado === 'bloqueado');
          if (carnet) this.cambiarEstadoCarnet(carnet.id, 'activo');
        }
      }
    }
  }

  getPenalidadesBySocio(socioId: string): PenalidadAcceso[] {
    return this._penalidades().filter((p) => p.socioId === socioId);
  }

  // ──── Configuración ────

  actualizarConfig(config: Partial<ConfiguracionAcceso>): void {
    this._config.update((prev) => ({ ...prev, ...config }));
  }

  // ──── Utilidades ────

  /** Calcula diferencia en minutos: horaA - horaB (positivo = A es después de B) */
  private _diffMinutos(horaA: string, horaB: string): number {
    const [hA, mA] = horaA.split(':').map(Number);
    const [hB, mB] = horaB.split(':').map(Number);
    return (hA * 60 + mA) - (hB * 60 + mB);
  }
}
