import { Injectable, signal, computed } from '@angular/core';
import { Postulante, EstadoPostulante, HistorialWorkflow } from '../models/postulante.model';

@Injectable({ providedIn: 'root' })
export class PostulanteService {
  readonly items = signal<Postulante[]>([
    {
      id: 'post-1',
      codigoPostulante: 'POST-001',
      nombre: 'Martina',
      apellido: 'Fernández',
      tipoDocumento: 'dni',
      dni: '45123456',
      email: 'martina.fernandez@example.com',
      telefono: '11-2233-4455',
      fechaNacimiento: '1998-07-15',
      sexo: 'femenino',
      nacionalidad: 'Argentina',
      direccion: 'Av. Rivadavia 3456, CABA',
      condicionDeseada: 'individual',
      estado: 'ingresado',
      fechaIngreso: '2026-05-10',
      observaciones: 'Referida por socia nro. 0042.',
      historial: [
        {
          estado: 'ingresado',
          fecha: '2026-05-10',
          operador: 'Admin',
          observacion: 'Registro inicial completado.',
        },
      ],
      documentos: [],
    },
    {
      id: 'post-2',
      codigoPostulante: 'POST-002',
      nombre: 'Rodrigo',
      apellido: 'Salas',
      tipoDocumento: 'dni',
      dni: '38900100',
      email: 'rodrigo.salas@example.com',
      telefono: '351-555-0011',
      fechaNacimiento: '1990-03-22',
      sexo: 'masculino',
      nacionalidad: 'Argentina',
      condicionDeseada: 'familiar',
      estado: 'documentacion_pendiente',
      fechaIngreso: '2026-05-05',
      historial: [
        {
          estado: 'ingresado',
          fecha: '2026-05-05',
          operador: 'Admin',
        },
        {
          estado: 'documentacion_pendiente',
          fecha: '2026-05-06',
          operador: 'Secretaría',
          observacion: 'Se solicitó DNI frente, dorso y fotografía.',
        },
      ],
      documentos: [],
    },
    {
      id: 'post-3',
      codigoPostulante: 'POST-003',
      nombre: 'Camila',
      apellido: 'Vega',
      tipoDocumento: 'dni',
      dni: '42007890',
      email: 'camila.vega@example.com',
      fechaNacimiento: '2002-11-30',
      sexo: 'femenino',
      nacionalidad: 'Argentina',
      condicionDeseada: 'individual',
      estado: 'en_evaluacion',
      fechaIngreso: '2026-04-28',
      historial: [
        { estado: 'ingresado', fecha: '2026-04-28', operador: 'Admin' },
        { estado: 'documentacion_pendiente', fecha: '2026-04-29', operador: 'Secretaría' },
        { estado: 'documentacion_completa', fecha: '2026-05-02', operador: 'Secretaría', observacion: 'Todos los documentos recibidos.' },
        { estado: 'en_evaluacion', fecha: '2026-05-08', operador: 'Comisión', observacion: 'Elevado a comisión directiva.' },
      ],
      documentos: [
        { id: 'd1', nombre: 'DNI Frente.jpg', tipo: 'dni_frente', cargadoEn: '2026-05-01' },
        { id: 'd2', nombre: 'DNI Dorso.jpg', tipo: 'dni_dorso', cargadoEn: '2026-05-01' },
        { id: 'd3', nombre: 'Foto.jpg', tipo: 'fotografia', cargadoEn: '2026-05-02' },
      ],
    },
  ]);

  // --- Computeds ---
  readonly ingresados = computed(() => this.items().filter(p => p.estado === 'ingresado'));
  readonly enProceso = computed(() =>
    this.items().filter(p =>
      p.estado === 'documentacion_pendiente' ||
      p.estado === 'documentacion_completa' ||
      p.estado === 'en_evaluacion'
    )
  );
  readonly aprobados = computed(() => this.items().filter(p => p.estado === 'aprobado'));
  readonly rechazados = computed(() => this.items().filter(p => p.estado === 'rechazado'));

  getById(id: string): Postulante | undefined {
    return this.items().find(p => p.id === id);
  }

  create(data: Omit<Postulante, 'id' | 'historial' | 'documentos' | 'estado' | 'codigoPostulante'>): void {
    const newId = `post-${Date.now()}`;
    const correlativo = (this.items().length + 1).toString().padStart(3, '0');
    const nuevo: Postulante = {
      ...data,
      id: newId,
      codigoPostulante: `POST-${correlativo}`,
      estado: 'ingresado',
      historial: [
        {
          estado: 'ingresado',
          fecha: data.fechaIngreso,
          operador: 'Admin',
          observacion: 'Registro inicial.',
        },
      ],
      documentos: [],
    };
    this.items.update(prev => [...prev, nuevo]);
  }

  avanzarEstado(
    id: string,
    nuevoEstado: EstadoPostulante,
    entrada: Omit<HistorialWorkflow, 'estado'>
  ): void {
    this.items.update(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              estado: nuevoEstado,
              historial: [...p.historial, { estado: nuevoEstado, ...entrada }],
            }
          : p
      )
    );
  }

  rechazar(id: string, motivo: string, operador: string, fecha: string): void {
    this.items.update(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              estado: 'rechazado' as EstadoPostulante,
              motivoRechazo: motivo,
              historial: [
                ...p.historial,
                { estado: 'rechazado' as EstadoPostulante, fecha, operador, observacion: motivo },
              ],
            }
          : p
      )
    );
  }

  marcarConvertido(id: string, socioId: string): void {
    this.items.update(prev =>
      prev.map(p => (p.id === id ? { ...p, socioConvertidoId: socioId } : p))
    );
  }

  delete(id: string): void {
    this.items.update(prev => prev.filter(p => p.id !== id));
  }
}
