import { Injectable, signal, computed } from '@angular/core';
import {
  Convenio,
  BeneficiarioConvenio,
  ReglaBeneficio,
  EstadoConvenio,
} from '../models/convenio.model';

// ──── Mock: Convenios ────

const MOCK_CONVENIOS: Convenio[] = [
  {
    id: 'conv-001',
    nombre: 'Convenio Royal 2026',
    empresa: 'Royal',
    descripcion: 'Beneficios para trabajadores de Royal. Descuento 35% (no socios obtienen tarifa de socio).',
    fechaInicio: '2026-01-01',
    fechaFin: '2026-12-31',
    reglasBeneficios: [
      {
        id: 'rb-001-1',
        condicionCliente: 'socio',
        tipo: 'descuento_porcentaje',
        valor: 20,
        cursoIds: [],
      },
      {
        id: 'rb-001-2',
        condicionCliente: 'no_socio',
        tipo: 'tarifa_socio',
        valor: 0,
        cursoIds: [],
      },
    ],
    acumularConCampana: false,
    estado: 'activo',
    contactoNombre: 'Recursos Humanos Royal',
    contactoEmail: 'rrhh@royal.com.pe',
    creadoEn: '2025-12-15',
  },
  {
    id: 'conv-002',
    nombre: 'Convenio Colegio La Unión 2026',
    empresa: 'Colegio La Unión',
    descripcion: 'Tarifa neta de S/ 90 para trabajadores del colegio en todos los cursos.',
    fechaInicio: '2026-03-01',
    fechaFin: '2026-12-31',
    reglasBeneficios: [
      {
        id: 'rb-002-1',
        condicionCliente: 'no_socio',
        tipo: 'tarifa_neta',
        valor: 90,
        cursoIds: [],
      },
    ],
    acumularConCampana: false,
    estado: 'activo',
    contactoNombre: 'Dirección Administrativa',
    contactoEmail: 'admin@launion.edu.pe',
    creadoEn: '2026-02-20',
  },
];

const MOCK_BENEFICIARIOS: BeneficiarioConvenio[] = [
  {
    id: 'ben-001',
    convenioId: 'conv-001',
    socioId: 'socio-1',
    nombreSocio: 'García, Carlos',
    dniSocio: '45678901',
    condicionEnConvenio: 'socio',
    fechaRegistro: '2026-01-15',
    activo: true,
  },
  {
    id: 'ben-002',
    convenioId: 'conv-002',
    socioId: 'socio-2',
    nombreSocio: 'López, Ana',
    dniSocio: '32109876',
    condicionEnConvenio: 'no_socio',
    fechaRegistro: '2026-03-05',
    activo: true,
  },
];

let _nextConvenioNum = MOCK_CONVENIOS.length + 1;
let _nextBeneficiarioNum = MOCK_BENEFICIARIOS.length + 1;
let _nextReglaNum = 10;

@Injectable({ providedIn: 'root' })
export class ConvenioService {
  private readonly _convenios = signal<Convenio[]>(MOCK_CONVENIOS);
  private readonly _beneficiarios = signal<BeneficiarioConvenio[]>(MOCK_BENEFICIARIOS);

  readonly convenios = this._convenios.asReadonly();
  readonly beneficiarios = this._beneficiarios.asReadonly();

  readonly conveniosActivos = computed(() =>
    this._convenios().filter((c) => c.estado === 'activo'),
  );

  readonly totalConvenios = computed(() => this._convenios().length);
  readonly totalBeneficiarios = computed(() =>
    this._beneficiarios().filter((b) => b.activo).length,
  );

  // ──── CRUD Convenios ────

  crear(data: Omit<Convenio, 'id' | 'creadoEn'>): Convenio {
    const nuevo: Convenio = {
      ...data,
      id: `conv-${String(_nextConvenioNum++).padStart(3, '0')}`,
      creadoEn: new Date().toISOString().slice(0, 10),
    };
    this._convenios.update((cs) => [...cs, nuevo]);
    return nuevo;
  }

  actualizar(id: string, changes: Partial<Convenio>): void {
    this._convenios.update((cs) =>
      cs.map((c) => (c.id === id ? { ...c, ...changes } : c)),
    );
  }

  cambiarEstado(id: string, estado: EstadoConvenio): void {
    this.actualizar(id, { estado });
  }

  getById(id: string): Convenio | undefined {
    return this._convenios().find((c) => c.id === id);
  }

  // ──── Reglas de beneficio ────

  agregarRegla(convenioId: string, regla: Omit<ReglaBeneficio, 'id'>): void {
    const nueva: ReglaBeneficio = {
      ...regla,
      id: `rb-${_nextReglaNum++}`,
    };
    this._convenios.update((cs) =>
      cs.map((c) =>
        c.id === convenioId
          ? { ...c, reglasBeneficios: [...c.reglasBeneficios, nueva] }
          : c,
      ),
    );
  }

  eliminarRegla(convenioId: string, reglaId: string): void {
    this._convenios.update((cs) =>
      cs.map((c) =>
        c.id === convenioId
          ? { ...c, reglasBeneficios: c.reglasBeneficios.filter((r) => r.id !== reglaId) }
          : c,
      ),
    );
  }

  // ──── Beneficiarios ────

  getBeneficiariosByConvenio(convenioId: string): BeneficiarioConvenio[] {
    return this._beneficiarios().filter((b) => b.convenioId === convenioId);
  }

  /**
   * Busca si el socio es beneficiario de algún convenio activo.
   * Devuelve el primer convenio activo que lo incluya.
   */
  getConvenioBySocio(
    socioId: string,
  ): { convenio: Convenio; beneficiario: BeneficiarioConvenio } | null {
    const beneficiario = this._beneficiarios().find(
      (b) => b.socioId === socioId && b.activo,
    );
    if (!beneficiario) return null;
    const convenio = this.getById(beneficiario.convenioId);
    if (!convenio || convenio.estado !== 'activo') return null;
    return { convenio, beneficiario };
  }

  agregarBeneficiario(data: Omit<BeneficiarioConvenio, 'id' | 'fechaRegistro'>): BeneficiarioConvenio {
    const nuevo: BeneficiarioConvenio = {
      ...data,
      id: `ben-${String(_nextBeneficiarioNum++).padStart(3, '0')}`,
      fechaRegistro: new Date().toISOString().slice(0, 10),
    };
    this._beneficiarios.update((bs) => [...bs, nuevo]);
    return nuevo;
  }

  toggleBeneficiario(id: string): void {
    this._beneficiarios.update((bs) =>
      bs.map((b) => (b.id === id ? { ...b, activo: !b.activo } : b)),
    );
  }
}
