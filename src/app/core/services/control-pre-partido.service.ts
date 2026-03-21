import { Injectable, inject } from '@angular/core';
import { EncuentroService } from './encuentro.service';
import { EquipoService } from './equipo.service';
import { CompetenciaService } from './competencia.service';
import { DisciplinaService } from './disciplina.service';
import { SancionService } from './sancion.service';
import { Participante } from '../models/equipo.model';
import { Competencia } from '../models/competencia.model';
import { FASE_LABELS } from '../models/encuentro.model';
import {
  CausalInhabilitacion,
  InhabilitacionJugador,
  ReportePrePartido,
} from '../models/control-pre-partido.model';

@Injectable({ providedIn: 'root' })
export class ControlPrePartidoService {
  private readonly encuentroService = inject(EncuentroService);
  private readonly equipoService = inject(EquipoService);
  private readonly competenciaService = inject(CompetenciaService);
  private readonly disciplinaService = inject(DisciplinaService);
  private readonly sancionService = inject(SancionService);

  generarReporte(encuentroId: string): ReportePrePartido | null {
    const encuentro = this.encuentroService.getById(encuentroId);
    if (!encuentro) return null;

    const competencia = this.competenciaService.getById(encuentro.competenciaId);
    if (!competencia) return null;

    const equipoLocal = this.equipoService.getEquipoById(encuentro.equipoLocalId);
    const equipoVisitante = this.equipoService.getEquipoById(encuentro.equipoVisitanteId);
    if (!equipoLocal || !equipoVisitante) return null;

    const disciplina = this.disciplinaService.items().find(d => d.id === encuentro.disciplinaId);
    const sede = encuentro.sedeId ? this.encuentroService.getSedeById(encuentro.sedeId) : undefined;
    const campo = encuentro.campoId ? this.encuentroService.getCampoById(encuentro.campoId) : undefined;
    const arbitro = encuentro.arbitroId ? this.encuentroService.getArbitroById(encuentro.arbitroId) : undefined;

    const inhabilitadosLocal = this.evaluarEquipo(equipoLocal.participantes, equipoLocal.id, equipoLocal.nombre, competencia);
    const inhabilitadosVisitante = this.evaluarEquipo(equipoVisitante.participantes, equipoVisitante.id, equipoVisitante.nombre, competencia);

    return {
      encuentroId,
      competenciaId: competencia.id,
      competenciaNombre: competencia.nombre,
      disciplinaNombre: disciplina?.nombre ?? 'Desconocida',
      fase: FASE_LABELS[encuentro.fase],
      numeroFecha: encuentro.numeroFecha,
      equipoLocalId: equipoLocal.id,
      equipoLocalNombre: equipoLocal.nombre,
      equipoVisitanteId: equipoVisitante.id,
      equipoVisitanteNombre: equipoVisitante.nombre,
      fechaHora: encuentro.fechaHora,
      sede: sede?.nombre,
      campo: campo?.nombre,
      arbitro: arbitro ? `${arbitro.nombre} ${arbitro.apellido}` : undefined,
      fechaGeneracion: new Date().toISOString(),
      inhabilitadosLocal,
      inhabilitadosVisitante,
      habilitadosLocal: equipoLocal.participantes.length - inhabilitadosLocal.length,
      habilitadosVisitante: equipoVisitante.participantes.length - inhabilitadosVisitante.length,
      totalJugadoresLocal: equipoLocal.participantes.length,
      totalJugadoresVisitante: equipoVisitante.participantes.length,
    };
  }

  private evaluarEquipo(
    participantes: Participante[],
    equipoId: string,
    equipoNombre: string,
    competencia: Competencia,
  ): InhabilitacionJugador[] {
    const inhabilitados: InhabilitacionJugador[] = [];

    for (const p of participantes) {
      const causales = this.evaluarCausales(p, competencia);
      if (causales.length > 0) {
        inhabilitados.push({
          participanteId: p.id,
          nombre: p.nombre,
          apellido: p.apellido,
          dni: p.dni,
          equipoId,
          equipoNombre,
          numeroCamiseta: p.numeroCamiseta,
          posicion: p.posicion,
          causales,
        });
      }
    }

    return inhabilitados;
  }

  private evaluarCausales(participante: Participante, competencia: Competencia): CausalInhabilitacion[] {
    const causales: CausalInhabilitacion[] = [];

    // 1. Deuda pendiente (cuota de mantenimiento)
    if (participante.deudaPendiente) {
      causales.push('deuda_pendiente');
    }

    // 2. Falta de declaración jurada de salud (exigida en categorías master)
    if (competencia.requiereDeclaracionSalud && !participante.declaracionJuradaSalud) {
      causales.push('falta_declaracion_salud');
    }

    // 3. Suspensión por tarjetas (sanción activa)
    const sancionesActivas = this.sancionService
      .getSancionesByParticipante(participante.id)
      .filter(s => s.estado === 'activa' && s.competenciaId === competencia.id);
    if (sancionesActivas.length > 0) {
      causales.push('suspension_tarjetas');
    }

    return causales;
  }
}
