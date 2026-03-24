import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Matricula,
  EstadoMatricula,
  TipoMatricula,
  CanalMatricula,
  DescuentoAplicado,
  PagoMatricula,
  ValidacionMatriculaDetalle,
  VacanteInfo,
  HistorialAcademico,
  FichaAlumno,
  MetodoPago,
} from '../models/matricula.model';
import { SocioService } from './socio.service';
import { AcademiaService } from './academia.service';
import { AcademiaMatriculaService } from './academia-matricula.service';

// ──── Mock Data ────

const MOCK_FICHAS: FichaAlumno[] = [
  {
    socioId: 'socio-1',
    personasRelacionadas: [
      { nombre: 'Juan', apellido: 'García', parentesco: 'Padre', dni: '20123456', telefono: '011-4555-0010', esApoderado: true },
    ],
    certificadoMedicoVigente: true,
    certificadoMedicoVencimiento: '2026-12-31',
    declaracionJuradaFirmada: true,
  },
  {
    socioId: 'socio-2',
    personasRelacionadas: [
      { nombre: 'Laura', apellido: 'López', parentesco: 'Madre', dni: '21234567', telefono: '011-4555-0020', email: 'laura.lopez@email.com', esApoderado: true },
    ],
    certificadoMedicoVigente: true,
    certificadoMedicoVencimiento: '2026-06-30',
    declaracionJuradaFirmada: true,
  },
];

const MOCK_MATRICULAS: Matricula[] = [
  {
    id: 'mat-new-1',
    socioId: 'socio-1',
    claseId: 'cls-nat-ninos-prin',
    tipo: 'nueva',
    canal: 'ventanilla',
    estado: 'confirmada',
    fechaRegistro: '2026-03-01',
    fechaConfirmacion: '2026-03-01',
    tarifaBase: 15000,
    descuentos: [],
    montoFinal: 15000,
    pagos: [
      { id: 'pago-1', matriculaId: 'mat-new-1', monto: 15000, metodo: 'efectivo', fecha: '2026-03-01' },
    ],
    estadoPago: 'pagado',
    creadoPor: 'admin',
  },
  {
    id: 'mat-new-2',
    socioId: 'socio-2',
    claseId: 'cls-kar-ninos-blanc',
    tipo: 'nueva',
    canal: 'portal',
    estado: 'pendiente_pago',
    fechaRegistro: '2026-03-02',
    tarifaBase: 12000,
    descuentos: [{ tipo: 'pronto_pago', descripcion: 'Descuento pronto pago 10%', porcentaje: 10 }],
    montoFinal: 10800,
    pagos: [],
    estadoPago: 'pendiente',
    reservaExpira: '2026-03-05',
    creadoPor: 'portal',
  },
  {
    id: 'mat-new-3',
    socioId: 'socio-1',
    claseId: 'cls-kar-ninos-blanc',
    tipo: 'renovacion',
    canal: 'ventanilla',
    estado: 'pagada',
    fechaRegistro: '2026-02-20',
    tarifaBase: 12000,
    descuentos: [{ tipo: 'hermanos', descripcion: 'Descuento hermanos 15%', porcentaje: 15 }],
    montoFinal: 10200,
    pagos: [
      { id: 'pago-3', matriculaId: 'mat-new-3', monto: 5100, metodo: 'tarjeta', fecha: '2026-02-20', referencia: 'TRX-001' },
      { id: 'pago-4', matriculaId: 'mat-new-3', monto: 5100, metodo: 'tarjeta', fecha: '2026-02-25', referencia: 'TRX-002' },
    ],
    estadoPago: 'pagado',
    creadoPor: 'admin',
  },
];

@Injectable({ providedIn: 'root' })
export class MatriculaService {
  private readonly socioService = inject(SocioService);
  private readonly academiaService = inject(AcademiaService);
  private readonly academiaMatriculaService = inject(AcademiaMatriculaService);

  private readonly _matriculas = signal<Matricula[]>(MOCK_MATRICULAS);
  private readonly _fichas = signal<FichaAlumno[]>(MOCK_FICHAS);

  readonly matriculas = this._matriculas.asReadonly();
  readonly fichas = this._fichas.asReadonly();

  // ──── Computed: lista detallada ────

  readonly matriculasDetalladas = computed(() =>
    this._matriculas().map((m) => {
      const socio = this.socioService.getById(m.socioId);
      const clase = this.academiaService.getClaseById(m.claseId);
      const curso = clase ? this.academiaService.getCursoById(clase.cursoId) : undefined;
      return {
        ...m,
        socioNombre: socio ? `${socio.apellido}, ${socio.nombre}` : '—',
        socioDni: socio?.dni ?? '—',
        cursoNombre: curso?.nombre ?? '—',
        periodo: clase?.periodo ?? '—',
      };
    }).sort((a, b) => b.fechaRegistro.localeCompare(a.fechaRegistro))
  );

  // ──── Computed: resúmenes para dashboard ────

  readonly totalConfirmadas = computed(() =>
    this._matriculas().filter((m) => m.estado === 'confirmada').length
  );

  readonly totalPendientes = computed(() =>
    this._matriculas().filter((m) => m.estado === 'pendiente_pago' || m.estado === 'reservada').length
  );

  readonly totalAnuladas = computed(() =>
    this._matriculas().filter((m) => m.estado === 'anulada').length
  );

  readonly totalRetiradas = computed(() =>
    this._matriculas().filter((m) => m.estado === 'retirada').length
  );

  // ──── CRUD ────

  getById(id: string): Matricula | undefined {
    return this._matriculas().find((m) => m.id === id);
  }

  getMatriculasBySocio(socioId: string): Matricula[] {
    return this._matriculas().filter((m) => m.socioId === socioId);
  }

  getFichaAlumno(socioId: string): FichaAlumno | undefined {
    return this._fichas().find((f) => f.socioId === socioId);
  }

  saveFichaAlumno(ficha: FichaAlumno): void {
    this._fichas.update((fichas) => {
      const idx = fichas.findIndex((f) => f.socioId === ficha.socioId);
      if (idx >= 0) {
        const updated = [...fichas];
        updated[idx] = ficha;
        return updated;
      }
      return [...fichas, ficha];
    });
  }

  // ──── Vacante Info ────

  getVacanteInfo(claseId: string): VacanteInfo | undefined {
    const clase = this.academiaService.getClaseById(claseId);
    if (!clase) return undefined;
    const reservadas = this._matriculas().filter(
      (m) => m.claseId === claseId && m.estado === 'reservada'
    ).length;
    return {
      claseId,
      totalVacantes: clase.vacantes,
      ocupadas: clase.matriculados,
      reservadas,
      disponibles: Math.max(clase.vacantes - clase.matriculados - reservadas, 0),
    };
  }

  // ──── Historial Académico ────

  getHistorialAcademico(socioId: string): HistorialAcademico[] {
    return this._matriculas()
      .filter((m) => m.socioId === socioId)
      .map((m) => {
        const clase = this.academiaService.getClaseById(m.claseId);
        const curso = clase ? this.academiaService.getCursoById(clase.cursoId) : undefined;
        return {
          socioId,
          cursoId: curso?.id ?? '',
          cursoNombre: curso?.nombre ?? '—',
          claseId: m.claseId,
          periodo: clase?.periodo ?? '—',
          estado: m.estado,
          fechaInicio: m.fechaRegistro,
          fechaFin: m.fechaAnulacion ?? m.fechaRetiro,
        };
      });
  }

  // ──── Validación ────

  validarMatricula(socioId: string, claseId: string): ValidacionMatriculaDetalle {
    const baseResult = this.academiaMatriculaService.validateMatricula(socioId, claseId);
    const clase = this.academiaService.getClaseById(claseId);

    const descuentosSugeridos: DescuentoAplicado[] = [];
    const otrasMatriculas = this._matriculas().filter(
      (m) => m.socioId === socioId && m.estado === 'confirmada'
    );
    if (otrasMatriculas.length > 0) {
      descuentosSugeridos.push({
        tipo: 'hermanos',
        descripcion: 'Descuento por múltiples matrículas 10%',
        porcentaje: 10,
      });
    }

    const duplicada = this._matriculas().some(
      (m) => m.socioId === socioId && m.claseId === claseId &&
        (m.estado === 'confirmada' || m.estado === 'pagada' || m.estado === 'pendiente_pago' || m.estado === 'reservada')
    );

    const mensajes = [...baseResult.mensajes.filter((msg) => !msg.startsWith('La matrícula cumple'))];
    if (duplicada) {
      mensajes.push('Ya existe una matrícula activa o pendiente para esta clase.');
    }

    const permitido = !duplicada && baseResult.permitido;

    if (permitido && mensajes.length === 0) {
      mensajes.push('Validación exitosa. Puede proceder con la matrícula.');
    }

    return {
      permitido,
      mensajes,
      edadSocio: baseResult.edadSocio as number | undefined,
      vacantesDisponibles: baseResult.vacantesDisponibles as number | undefined,
      tarifaSugerida: clase?.tarifaMatricula ?? clase?.tarifaMensual ?? 0,
      descuentosSugeridos,
    };
  }

  // ──── Calcular Monto Final ────

  calcularMontoFinal(tarifaBase: number, descuentos: DescuentoAplicado[]): number {
    const totalDescuento = descuentos.reduce((sum, d) => sum + d.porcentaje, 0);
    const factor = Math.max(1 - totalDescuento / 100, 0);
    return Math.round(tarifaBase * factor * 100) / 100;
  }

  // ──── Registrar Matrícula ────

  registrar(data: {
    socioId: string;
    claseId: string;
    tipo: TipoMatricula;
    canal: CanalMatricula;
    descuentos: DescuentoAplicado[];
    tarifaBase: number;
    observaciones?: string;
  }): Matricula | undefined {
    const validacion = this.validarMatricula(data.socioId, data.claseId);
    if (!validacion.permitido) return undefined;

    const montoFinal = this.calcularMontoFinal(data.tarifaBase, data.descuentos);
    const hoy = new Date().toISOString().split('T')[0];
    const expira = new Date();
    expira.setDate(expira.getDate() + 3);

    const matricula: Matricula = {
      id: crypto.randomUUID(),
      socioId: data.socioId,
      claseId: data.claseId,
      tipo: data.tipo,
      canal: data.canal,
      estado: 'reservada',
      fechaRegistro: hoy,
      tarifaBase: data.tarifaBase,
      descuentos: data.descuentos,
      montoFinal,
      pagos: [],
      estadoPago: 'pendiente',
      reservaExpira: expira.toISOString().split('T')[0],
      observaciones: data.observaciones,
      creadoPor: data.canal === 'portal' ? 'portal' : 'admin',
    };

    this._matriculas.update((list) => [matricula, ...list]);
    return matricula;
  }

  // ──── Registrar Pago ────

  registrarPago(matriculaId: string, monto: number, metodo: MetodoPago, referencia?: string): boolean {
    const matricula = this.getById(matriculaId);
    if (!matricula) return false;
    if (matricula.estado === 'anulada' || matricula.estado === 'retirada') return false;

    const pago: PagoMatricula = {
      id: crypto.randomUUID(),
      matriculaId,
      monto,
      metodo,
      fecha: new Date().toISOString().split('T')[0],
      referencia,
    };

    this._matriculas.update((list) =>
      list.map((m) => {
        if (m.id !== matriculaId) return m;
        const pagos = [...m.pagos, pago];
        const totalPagado = pagos.reduce((s, p) => s + p.monto, 0);
        const estadoPago = totalPagado >= m.montoFinal ? 'pagado' as const : 'parcial' as const;
        const estado: EstadoMatricula = estadoPago === 'pagado' ? 'pagada' : 'pendiente_pago';
        return { ...m, pagos, estadoPago, estado };
      })
    );
    return true;
  }

  // ──── Confirmar Matrícula ────

  confirmar(id: string): boolean {
    const matricula = this.getById(id);
    if (!matricula || matricula.estado !== 'pagada') return false;

    this._matriculas.update((list) =>
      list.map((m) =>
        m.id === id
          ? { ...m, estado: 'confirmada' as const, fechaConfirmacion: new Date().toISOString().split('T')[0] }
          : m
      )
    );

    const clase = this.academiaService.getClaseById(matricula.claseId);
    if (clase) {
      this.academiaService.updateClase(matricula.claseId, {
        matriculados: clase.matriculados + 1,
        estado: clase.matriculados + 1 >= clase.vacantes ? 'llena' : clase.estado,
      });
    }
    return true;
  }

  // ──── Anular Matrícula ────

  anular(id: string, motivo: string): boolean {
    const matricula = this.getById(id);
    if (!matricula || matricula.estado === 'anulada' || matricula.estado === 'retirada') return false;

    this._matriculas.update((list) =>
      list.map((m) =>
        m.id === id
          ? {
              ...m,
              estado: 'anulada' as const,
              fechaAnulacion: new Date().toISOString().split('T')[0],
              motivoAnulacion: 'solicitud_alumno' as const,
              observaciones: motivo,
            }
          : m
      )
    );

    if (matricula.estado === 'confirmada') {
      const clase = this.academiaService.getClaseById(matricula.claseId);
      if (clase) {
        this.academiaService.updateClase(matricula.claseId, {
          matriculados: Math.max(clase.matriculados - 1, 0),
          estado: 'abierta',
        });
      }
    }
    return true;
  }

  // ──── Retirar Matrícula ────

  retirar(id: string, motivo: string): boolean {
    const matricula = this.getById(id);
    if (!matricula || matricula.estado !== 'confirmada') return false;

    this._matriculas.update((list) =>
      list.map((m) =>
        m.id === id
          ? {
              ...m,
              estado: 'retirada' as const,
              fechaRetiro: new Date().toISOString().split('T')[0],
              motivoRetiro: 'voluntario' as const,
              observaciones: motivo,
            }
          : m
      )
    );

    const clase = this.academiaService.getClaseById(matricula.claseId);
    if (clase) {
      this.academiaService.updateClase(matricula.claseId, {
        matriculados: Math.max(clase.matriculados - 1, 0),
        estado: 'abierta',
      });
    }
    return true;
  }
}
