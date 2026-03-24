import { Injectable, computed, signal } from '@angular/core';
import { Dependiente, Socio } from '../models/socio.model';

const MOCK_SOCIOS: Socio[] = [
  {
    id: 'socio-1',
    codigoSocio: 'S-0001',
    nombre: 'Carlos Andrés',
    apellido: 'García Medina',
    dni: '30123456',
    email: 'carlos.garcia@email.com',
    telefono: '011-4555-0001',
    fechaNacimiento: '1990-05-15',
    direccion: 'Calle Falsa 123',
    condicionSocietaria: 'familiar',
    condicionInstitucional: 'socio',
    estado: 'activo',
    fechaAlta: '2024-01-10',
    dependientes: [
      {
        id: 'dep-1',
        nombre: 'Valeria Paola',
        apellido: 'Montoya de García',
        dni: '32198765',
        fechaNacimiento: '1992-07-25',
        relacion: 'conyuge',
        condicion: 'dependiente',
        marcaProteccionPermanencia: false,
        estado: 'activo',
        fechaAlta: '2024-01-10',
      },
      {
        id: 'dep-2',
        nombre: 'Lucas Sebastián',
        apellido: 'García Montoya',
        dni: '55100001',
        fechaNacimiento: '2018-03-20',
        relacion: 'hijo',
        condicion: 'dependiente',
        marcaProteccionPermanencia: false,
        estado: 'activo',
        fechaAlta: '2024-01-10',
      },
      {
        id: 'dep-3',
        nombre: 'Sofía Valentina',
        apellido: 'García Montoya',
        dni: '55100009',
        fechaNacimiento: '2020-11-12',
        relacion: 'hija',
        condicion: 'dependiente',
        marcaProteccionPermanencia: true,
        estado: 'activo',
        fechaAlta: '2024-01-10',
      },
    ],
  },
  {
    id: 'socio-2',
    codigoSocio: 'S-0002',
    nombre: 'María Fernanda',
    apellido: 'López Paredes',
    dni: '31234567',
    email: 'maria.lopez@email.com',
    telefono: '011-4555-0002',
    fechaNacimiento: '1988-11-22',
    condicionSocietaria: 'individual',
    condicionInstitucional: 'socio',
    estado: 'activo',
    fechaAlta: '2024-02-05',
  },
  {
    id: 'socio-3',
    codigoSocio: 'S-0003',
    nombre: 'Roberto Alejandro',
    apellido: 'Martínez Vega',
    dni: '32345678',
    email: 'r.martinez@email.com',
    condicionSocietaria: 'individual',
    condicionInstitucional: 'socio',
    estado: 'suspendido',
    fechaAlta: '2023-06-20',
    observaciones: 'Suspendido por falta de pago',
  },
  {
    id: 'socio-4',
    codigoSocio: 'S-0004',
    nombre: 'Ana Cecilia',
    apellido: 'Fernández Quispe',
    dni: '33456789',
    telefono: '011-4555-0004',
    condicionSocietaria: 'familiar',
    condicionInstitucional: 'socio',
    estado: 'inactivo',
    fechaAlta: '2023-01-15',
    fechaBaja: '2024-12-01',
    dependientes: [
      {
        id: 'dep-4',
        nombre: 'Hernán Eduardo',
        apellido: 'Fernández Quispe',
        dni: '28345001',
        fechaNacimiento: '1986-04-03',
        relacion: 'conyuge',
        condicion: 'dependiente',
        marcaProteccionPermanencia: false,
        estado: 'inactivo',
        fechaAlta: '2023-01-15',
        fechaBaja: '2024-12-01',
      },
      {
        id: 'dep-5',
        nombre: 'Martín Ignacio',
        apellido: 'Fernández Quispe',
        dni: '55100005',
        fechaNacimiento: '2011-09-14',
        relacion: 'hijo',
        condicion: 'dependiente',
        marcaProteccionPermanencia: true,
        estado: 'inactivo',
        fechaAlta: '2023-01-15',
        fechaBaja: '2024-12-01',
      },
      {
        id: 'dep-6',
        nombre: 'Clara Sofía',
        apellido: 'Fernández Quispe',
        dni: '55100006',
        fechaNacimiento: '2014-02-28',
        relacion: 'hija',
        condicion: 'dependiente',
        discapacidad: { tieneDiscapacidad: true, tipo: 'Motriz leve', grado: 'Leve', numeroConadis: 'CN-00182' },
        marcaProteccionPermanencia: true,
        estado: 'inactivo',
        fechaAlta: '2023-01-15',
        fechaBaja: '2024-12-01',
      },
    ],
  },
  {
    id: 'socio-5',
    codigoSocio: 'S-0005',
    nombre: 'Luciana Beatriz',
    apellido: 'Torres Romero',
    dni: '34567890',
    email: 'luciana.torres@email.com',
    telefono: '011-4555-0005',
    fechaNacimiento: '2012-03-08',
    direccion: 'Av. Rivadavia 4500',
    condicionSocietaria: 'transitorio_menor',
    condicionInstitucional: 'socio',
    estado: 'activo',
    fechaAlta: '2024-03-12',
  },
  {
    id: 'socio-6',
    nombre: 'Diego Emiliano',
    apellido: 'Ramírez Flores',
    dni: '35678901',
    email: 'diego.ramirez@email.com',
    telefono: '011-4555-0006',
    fechaNacimiento: '2010-07-19',
    estado: 'activo',
    fechaAlta: '2024-04-01',
  },
  {
    id: 'socio-7',
    nombre: 'Valentina Soledad',
    apellido: 'Sánchez Calderón',
    dni: '36789012',
    email: 'v.sanchez@email.com',
    telefono: '011-4555-0007',
    fechaNacimiento: '2014-01-25',
    direccion: 'Calle Belgrano 890',
    estado: 'activo',
    fechaAlta: '2024-05-18',
  },
  {
    id: 'socio-8',
    nombre: 'Matías Ezequiel',
    apellido: 'Herrera Ramos',
    dni: '37890123',
    email: 'matias.herrera@email.com',
    fechaNacimiento: '2008-09-03',
    estado: 'activo',
    fechaAlta: '2024-06-10',
  },
  {
    id: 'socio-9',
    nombre: 'Sofía Alejandra',
    apellido: 'Morales Ibáñez',
    dni: '38901234',
    email: 'sofia.morales@email.com',
    telefono: '011-4555-0009',
    fechaNacimiento: '2011-12-14',
    direccion: 'Av. San Martín 2300',
    estado: 'activo',
    fechaAlta: '2025-01-08',
  },
  {
    id: 'socio-10',
    nombre: 'Joaquín Nicolás',
    apellido: 'Álvarez Mendoza',
    dni: '39012345',
    telefono: '011-4555-0010',
    fechaNacimiento: '2013-06-30',
    estado: 'activo',
    fechaAlta: '2025-02-20',
  },
  {
    id: 'socio-11',
    nombre: 'Camila Andrea',
    apellido: 'Ruiz Villanueva',
    dni: '40123456',
    email: 'camila.ruiz@email.com',
    telefono: '011-4555-0011',
    fechaNacimiento: '2009-04-11',
    estado: 'suspendido',
    fechaAlta: '2024-08-15',
    observaciones: 'Suspendida por deuda pendiente',
  },
  {
    id: 'socio-12',
    nombre: 'Tomás Benjamín',
    apellido: 'Pérez Aguirre',
    dni: '41234567',
    email: 'tomas.perez@email.com',
    fechaNacimiento: '2015-10-22',
    direccion: 'Pasaje Los Olivos 45',
    estado: 'activo',
    fechaAlta: '2025-03-01',
  },
  {
    id: 'socio-13',
    nombre: 'Isabella Renata',
    apellido: 'Gutiérrez Navas',
    dni: '42345678',
    email: 'isa.gutierrez@email.com',
    telefono: '011-4555-0013',
    fechaNacimiento: '2007-08-05',
    estado: 'activo',
    fechaAlta: '2025-03-10',
  },
  {
    id: 'socio-14',
    nombre: 'Nicolás Rodrigo',
    apellido: 'Castro Linares',
    dni: '43456789',
    telefono: '011-4555-0014',
    fechaNacimiento: '2011-02-17',
    estado: 'inactivo',
    fechaAlta: '2023-09-05',
    fechaBaja: '2025-01-31',
  },
];

@Injectable({ providedIn: 'root' })
export class SocioService {
  private readonly _items = signal<Socio[]>(MOCK_SOCIOS);
  readonly items = this._items.asReadonly();

  readonly sociosActivos = computed(() => this._items().filter((s) => s.estado === 'activo'));
  readonly sociosSuspendidos = computed(() => this._items().filter((s) => s.estado === 'suspendido'));

  getById(id: string): Socio | undefined {
    return this._items().find((s) => s.id === id);
  }

  buscarPorDni(dni: string): Socio | undefined {
    return this._items().find((s) => s.dni === dni);
  }

  buscar(query: string): Socio[] {
    const q = query.toLowerCase();
    return this._items().filter(
      (s) =>
        s.nombre.toLowerCase().includes(q) ||
        s.apellido.toLowerCase().includes(q) ||
        s.dni.includes(q) ||
        (s.codigoSocio ?? '').toLowerCase().includes(q)
    );
  }

  create(item: Omit<Socio, 'id'>): void {
    this._items.update((items) => [...items, { ...item, id: crypto.randomUUID() }]);
  }

  update(id: string, changes: Partial<Socio>): void {
    this._items.update((items) =>
      items.map((i) => (i.id === id ? { ...i, ...changes } : i))
    );
  }

  delete(id: string): void {
    this._items.update((items) => items.filter((i) => i.id !== id));
  }

  agregarDependiente(socioId: string, dependiente: Omit<Dependiente, 'id'>): void {
    this._items.update((items) =>
      items.map((s) =>
        s.id === socioId
          ? {
              ...s,
              dependientes: [
                ...(s.dependientes ?? []),
                { ...dependiente, id: crypto.randomUUID() },
              ],
            }
          : s
      )
    );
  }

  actualizarDependiente(socioId: string, dependienteId: string, changes: Partial<Dependiente>): void {
    this._items.update((items) =>
      items.map((s) =>
        s.id === socioId
          ? {
              ...s,
              dependientes: (s.dependientes ?? []).map((d) =>
                d.id === dependienteId ? { ...d, ...changes } : d
              ),
            }
          : s
      )
    );
  }

  cambiarCondicion(id: string, nuevaCondicion: Socio['condicionSocietaria']): void {
    this.update(id, { condicionSocietaria: nuevaCondicion });
  }

  inactivar(id: string, fechaBaja: string): void {
    this.update(id, { estado: 'inactivo', fechaBaja });
  }

  reactivar(id: string): void {
    this.update(id, { estado: 'activo', fechaBaja: undefined });
  }
}
