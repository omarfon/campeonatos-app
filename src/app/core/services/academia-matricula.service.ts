import { Injectable, computed, inject, signal } from '@angular/core';
import {
  MatriculaAcademica,
  NivelAcreditadoSocio,
  ValidacionMatriculaResultado,
} from '../models/academia.model';
import { SocioService } from './socio.service';
import { AcademiaService } from './academia.service';

const MOCK_NIVELES_ACREDITADOS: NivelAcreditadoSocio[] = [
  {
    id: 'niv-soc-1',
    socioId: 'socio-1',
    cursoId: 'cur-natacion',
    nivelId: 'niv-nat-2',
    fechaAcreditacion: '2025-12-15',
    observacion: 'Evaluación interna aprobada.',
  },
  {
    id: 'niv-soc-2',
    socioId: 'socio-2',
    cursoId: 'cur-karate',
    nivelId: 'niv-kar-1',
    fechaAcreditacion: '2025-10-10',
  },
  {
    id: 'niv-soc-3',
    socioId: 'socio-2',
    cursoId: 'cur-ingles',
    nivelId: 'niv-ing-2',
    fechaAcreditacion: '2025-11-20',
  },
];

const MOCK_MATRICULAS: MatriculaAcademica[] = [
  {
    id: 'mat-1',
    socioId: 'socio-1',
    claseId: 'cls-nat-ninos-prin',
    fechaRegistro: '2026-03-01',
    estado: 'activa',
  },
  {
    id: 'mat-2',
    socioId: 'socio-2',
    claseId: 'cls-kar-ninos-blanc',
    fechaRegistro: '2026-03-02',
    estado: 'activa',
  },
];

@Injectable({ providedIn: 'root' })
export class AcademiaMatriculaService {
  private readonly academiaService = inject(AcademiaService);
  private readonly socioService = inject(SocioService);

  private readonly _nivelesAcreditados = signal<NivelAcreditadoSocio[]>(MOCK_NIVELES_ACREDITADOS);
  private readonly _matriculas = signal<MatriculaAcademica[]>(MOCK_MATRICULAS);

  readonly nivelesAcreditados = this._nivelesAcreditados.asReadonly();
  readonly matriculas = this._matriculas.asReadonly();

  readonly matriculasDetalladas = computed(() =>
    this._matriculas()
      .map((matricula) => {
        const socio = this.socioService.getById(matricula.socioId);
        const clase = this.academiaService.getClaseById(matricula.claseId);
        const curso = clase ? this.academiaService.getCursoById(clase.cursoId) : undefined;

        return {
          ...matricula,
          socioNombre: socio ? `${socio.apellido}, ${socio.nombre}` : 'Socio no encontrado',
          cursoNombre: curso?.nombre ?? 'Curso no encontrado',
          periodo: clase?.periodo ?? '—',
        };
      })
      .sort((a, b) => b.fechaRegistro.localeCompare(a.fechaRegistro))
  );

  getNivelAcreditadoSocio(socioId: string, cursoId: string) {
    const registro = this._nivelesAcreditados().find(
      (nivel) => nivel.socioId === socioId && nivel.cursoId === cursoId
    );

    return registro ? this.academiaService.getNivelById(registro.nivelId) : undefined;
  }

  getMatriculasBySocio(socioId: string): MatriculaAcademica[] {
    return this._matriculas().filter((matricula) => matricula.socioId === socioId);
  }

  validateMatricula(socioId: string, claseId: string): ValidacionMatriculaResultado {
    const mensajes: string[] = [];
    const socio = this.socioService.getById(socioId);
    const clase = this.academiaService.getClaseById(claseId);

    if (!socio) {
      return { permitido: false, mensajes: ['Seleccione un socio válido.'] };
    }

    if (!clase) {
      return { permitido: false, mensajes: ['Seleccione una clase válida.'] };
    }

    const curso = this.academiaService.getCursoById(clase.cursoId);
    const categoriaEdad = this.academiaService.getCategoriaEdadById(clase.categoriaEdadId);
    const nivelRequerido = clase.nivelId ? this.academiaService.getNivelById(clase.nivelId) : undefined;
    const nivelAcreditado = this.getNivelAcreditadoSocio(socioId, clase.cursoId);
    const edadSocio = this.calcularEdad(socio.fechaNacimiento);
    const topeRegularAmbiente = this.academiaService.getAforoRegularDisponibleAmbiente(clase.ambienteId);
    const vacantesDisponibles = Math.max(Math.min(clase.vacantes, topeRegularAmbiente) - clase.matriculados, 0);

    if (socio.estado !== 'activo') {
      mensajes.push('El socio debe estar activo para registrar la matrícula.');
    }

    if (!curso || curso.estado !== 'activo') {
      mensajes.push('El curso asociado a la clase no está disponible para matrícula.');
    }

    if (clase.estado !== 'abierta') {
      mensajes.push('La clase debe encontrarse abierta para permitir nuevas matrículas.');
    }

    if (vacantesDisponibles <= 0) {
      mensajes.push('No hay vacantes disponibles en la clase seleccionada.');
    }

    const matriculaDuplicada = this._matriculas().some(
      (matricula) =>
        matricula.socioId === socioId &&
        matricula.claseId === claseId &&
        matricula.estado === 'activa'
    );

    if (matriculaDuplicada) {
      mensajes.push('El socio ya cuenta con una matrícula activa en esta clase.');
    }

    if (categoriaEdad) {
      if (edadSocio === undefined) {
        mensajes.push('El socio debe registrar fecha de nacimiento para validar la categoría por edad.');
      } else if (edadSocio < categoriaEdad.edadMinima || edadSocio > categoriaEdad.edadMaxima) {
        mensajes.push(
          `La edad del socio no cumple el rango permitido (${categoriaEdad.edadMinima}-${categoriaEdad.edadMaxima} años).`
        );
      }
    }

    if (curso?.manejaLevels && nivelRequerido) {
      if (!nivelAcreditado && nivelRequerido.orden > 1) {
        mensajes.push('El socio no tiene un nivel acreditado suficiente para esta clase.');
      } else if (nivelAcreditado && nivelAcreditado.orden < nivelRequerido.orden) {
        mensajes.push(
          `El nivel acreditado (${nivelAcreditado.nombre}) es inferior al nivel requerido (${nivelRequerido.nombre}).`
        );
      }
    }

    if (mensajes.length === 0) {
      mensajes.push('La matrícula cumple validación de edad, nivel y disponibilidad.');
    }

    return {
      permitido: mensajes.length === 1 && mensajes[0].startsWith('La matrícula cumple'),
      mensajes,
      edadSocio,
      categoriaEdad,
      nivelRequerido,
      nivelAcreditado,
      vacantesDisponibles,
    };
  }

  registrarMatricula(socioId: string, claseId: string): ValidacionMatriculaResultado {
    const resultado = this.validateMatricula(socioId, claseId);

    if (!resultado.permitido) {
      return resultado;
    }

    this._matriculas.update((matriculas) => [
      {
        id: crypto.randomUUID(),
        socioId,
        claseId,
        fechaRegistro: new Date().toISOString().split('T')[0] ?? '',
        estado: 'activa',
      },
      ...matriculas,
    ]);

    const clase = this.academiaService.getClaseById(claseId);
    if (clase) {
      this.academiaService.updateClase(claseId, {
        matriculados: clase.matriculados + 1,
        estado: clase.matriculados + 1 >= clase.vacantes ? 'llena' : clase.estado,
      });
    }

    return {
      ...resultado,
      mensajes: ['Matrícula registrada correctamente.', ...resultado.mensajes],
    };
  }

  private calcularEdad(fechaNacimiento?: string): number | undefined {
    if (!fechaNacimiento) {
      return undefined;
    }

    const nacimiento = new Date(fechaNacimiento);
    if (Number.isNaN(nacimiento.getTime())) {
      return undefined;
    }

    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad -= 1;
    }

    return edad;
  }
}
