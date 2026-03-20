import { Injectable, inject, computed } from '@angular/core';
import { TablaPosiciones, PosicionEquipo, Goleador, EstadisticaAmonestado, RankingHistorico } from '../models/estadistica.model';
import { EncuentroService } from './encuentro.service';
import { ResultadoService } from './resultado.service';
import { EquipoService } from './equipo.service';
import { SancionService } from './sancion.service';

@Injectable({ providedIn: 'root' })
export class EstadisticaService {
  private readonly encuentroService = inject(EncuentroService);
  private readonly resultadoService = inject(ResultadoService);
  private readonly equipoService = inject(EquipoService);
  private readonly sancionService = inject(SancionService);

  calcularTablaPosiciones(campeonatoId: string, disciplinaId: string): TablaPosiciones {
    const equipos = this.equipoService.equipos().filter(
      (e) => e.campeonatoId === campeonatoId && e.disciplinaId === disciplinaId
    );
    const encuentros = this.encuentroService.encuentros().filter(
      (e) => e.campeonatoId === campeonatoId && e.disciplinaId === disciplinaId && e.estado === 'finalizado'
    );

    const posiciones: PosicionEquipo[] = equipos.map((equipo) => {
      let ganados = 0, empatados = 0, perdidos = 0, golesAFavor = 0, golesEnContra = 0;

      for (const enc of encuentros) {
        const resultado = this.resultadoService.getByEncuentro(enc.id);
        if (!resultado) continue;

        const esLocal = enc.equipoLocalId === equipo.id;
        const esVisitante = enc.equipoVisitanteId === equipo.id;
        if (!esLocal && !esVisitante) continue;

        const golesPropios = esLocal ? resultado.golesLocal : resultado.golesVisitante;
        const golesRival = esLocal ? resultado.golesVisitante : resultado.golesLocal;

        golesAFavor += golesPropios;
        golesEnContra += golesRival;

        if (golesPropios > golesRival) ganados++;
        else if (golesPropios === golesRival) empatados++;
        else perdidos++;
      }

      const puntos = ganados * 3 + empatados;
      const tarjetasEquipo = equipo.participantes.reduce((acc, p) => {
        return acc + this.sancionService.contarAmarillasByParticipante(p.id) + this.sancionService.contarRojasByParticipante(p.id) * 3;
      }, 0);

      return {
        equipoId: equipo.id,
        equipoNombre: equipo.nombre,
        partidosJugados: ganados + empatados + perdidos,
        ganados,
        empatados,
        perdidos,
        golesAFavor,
        golesEnContra,
        diferenciaGoles: golesAFavor - golesEnContra,
        puntos,
        fairPlay: Math.max(0, 100 - tarjetasEquipo),
        posicion: 0,
      };
    });

    posiciones.sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      if (b.diferenciaGoles !== a.diferenciaGoles) return b.diferenciaGoles - a.diferenciaGoles;
      return b.golesAFavor - a.golesAFavor;
    });

    posiciones.forEach((p, i) => (p.posicion = i + 1));

    return { campeonatoId, disciplinaId, posiciones };
  }

  calcularGoleadores(campeonatoId: string, disciplinaId: string): Goleador[] {
    const goles = this.resultadoService.goles();
    const encuentros = this.encuentroService.encuentros().filter(
      (e) => e.campeonatoId === campeonatoId && e.disciplinaId === disciplinaId
    );
    const encuentroIds = new Set(encuentros.map((e) => e.id));

    const resultadoIds = this.resultadoService.resultados()
      .filter((r) => encuentroIds.has(r.encuentroId))
      .map((r) => r.id);
    const resultadoIdSet = new Set(resultadoIds);

    const golesRelevantes = goles.filter((g) => resultadoIdSet.has(g.resultadoId));

    const goleadorMap = new Map<string, Goleador>();
    for (const gol of golesRelevantes) {
      const participante = this.equipoService.getParticipante(gol.participanteId);
      if (!participante) continue;
      const equipo = this.equipoService.getEquipoById(gol.equipoId);

      const existing = goleadorMap.get(gol.participanteId);
      if (existing) {
        existing.goles++;
        if (gol.tipo === 'penal') existing.penales++;
      } else {
        goleadorMap.set(gol.participanteId, {
          participanteId: gol.participanteId,
          nombre: participante.nombre,
          apellido: participante.apellido,
          equipoId: gol.equipoId,
          equipoNombre: equipo?.nombre ?? '',
          goles: 1,
          penales: gol.tipo === 'penal' ? 1 : 0,
          asistencias: 0,
        });
      }
    }

    return Array.from(goleadorMap.values()).sort((a, b) => b.goles - a.goles);
  }

  calcularAmonestados(campeonatoId: string): EstadisticaAmonestado[] {
    const participantes = this.equipoService.getAllParticipantes();
    const equiposCamp = this.equipoService.getEquiposByCampeonato(campeonatoId);
    const participanteIds = new Set(equiposCamp.flatMap((e) => e.participantes.map((p) => p.id)));

    return participantes
      .filter((p) => participanteIds.has(p.id))
      .map((p) => {
        const equipo = this.equipoService.getEquipoById(p.equipoId);
        const tarjetas = this.sancionService.getTarjetasByParticipante(p.id);
        const amarillas = tarjetas.filter((t) => t.tipo === 'amarilla').length;
        const rojasDirectas = tarjetas.filter((t) => t.tipo === 'roja_directa').length;
        const dobleAmarilla = tarjetas.filter((t) => t.tipo === 'doble_amarilla').length;
        const sanciones = this.sancionService.getSancionesByParticipante(p.id);
        const fechasSancionado = sanciones.reduce((acc, s) => acc + s.fechasInhabilitacion, 0);

        return {
          participanteId: p.id,
          nombre: p.nombre,
          apellido: p.apellido,
          equipoId: p.equipoId,
          equipoNombre: equipo?.nombre ?? '',
          amarillas,
          rojas: rojasDirectas,
          dobleAmarilla,
          fechasSancionado,
        };
      })
      .filter((a) => a.amarillas > 0 || a.rojas > 0 || a.dobleAmarilla > 0)
      .sort((a, b) => b.amarillas + b.rojas * 3 - (a.amarillas + a.rojas * 3));
  }

  getRankingHistorico(): RankingHistorico[] {
    return [
      {
        campeonatoId: 'camp-2025',
        campeonatoNombre: 'Campeonato Interno 2025',
        temporada: '2025',
        equipoCampeonId: 'eq-1',
        equipoCampeonNombre: 'Los Tigres',
        goleadorId: 'p-2',
        goleadorNombre: 'Juan Pérez',
        mejorFairPlayId: 'eq-3',
      },
    ];
  }
}
