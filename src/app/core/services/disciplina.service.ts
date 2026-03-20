import { Injectable, signal, computed } from '@angular/core';
import { Disciplina, ReglaDisciplina } from '../models/disciplina.model';

const MOCK_DISCIPLINAS: Disciplina[] = [
  {
    id: 'disc-futbol',
    nombre: 'Fútbol',
    descripcion: 'Fútbol 11 reglamentario',
    tipoPlanilla: 'futbol',
    reglas: [
      { id: 'r1', disciplinaId: 'disc-futbol', nombre: 'Puntos por victoria', descripcion: 'Puntos otorgados al equipo ganador', valor: '3' },
      { id: 'r2', disciplinaId: 'disc-futbol', nombre: 'Puntos por empate', descripcion: 'Puntos otorgados a cada equipo en empate', valor: '1' },
      { id: 'r3', disciplinaId: 'disc-futbol', nombre: 'Amarillas para suspensión', descripcion: 'Cantidad de amarillas acumuladas para suspensión automática', valor: '5' },
    ],
    maxJugadoresPorEquipo: 25,
    minJugadoresPorEquipo: 11,
    duracionPartidoMinutos: 90,
    tiemposExtra: true,
    penales: true,
  },
  {
    id: 'disc-voley',
    nombre: 'Vóley',
    descripcion: 'Vóleibol de cancha',
    tipoPlanilla: 'voley',
    reglas: [
      { id: 'r4', disciplinaId: 'disc-voley', nombre: 'Sets para ganar', descripcion: 'Cantidad de sets necesarios para ganar', valor: '3' },
      { id: 'r5', disciplinaId: 'disc-voley', nombre: 'Puntos por set', descripcion: 'Puntos necesarios para ganar un set', valor: '25' },
    ],
    maxJugadoresPorEquipo: 14,
    minJugadoresPorEquipo: 6,
    duracionPartidoMinutos: undefined,
    tiemposExtra: false,
    penales: false,
  },
  {
    id: 'disc-basquet',
    nombre: 'Básquet',
    descripcion: 'Baloncesto 5 contra 5',
    tipoPlanilla: 'general',
    reglas: [
      { id: 'r6', disciplinaId: 'disc-basquet', nombre: 'Cuartos', descripcion: 'Cantidad de cuartos por partido', valor: '4' },
      { id: 'r7', disciplinaId: 'disc-basquet', nombre: 'Minutos por cuarto', descripcion: 'Duración de cada cuarto en minutos', valor: '10' },
    ],
    maxJugadoresPorEquipo: 15,
    minJugadoresPorEquipo: 5,
    duracionPartidoMinutos: 40,
    tiemposExtra: true,
    penales: false,
  },
  {
    id: 'disc-atletismo',
    nombre: 'Atletismo',
    descripcion: 'Pruebas de pista y campo',
    tipoPlanilla: 'atletismo',
    reglas: [],
    maxJugadoresPorEquipo: 30,
    minJugadoresPorEquipo: 1,
    duracionPartidoMinutos: undefined,
    tiemposExtra: false,
    penales: false,
  },
];

@Injectable({ providedIn: 'root' })
export class DisciplinaService {
  private readonly _items = signal<Disciplina[]>(MOCK_DISCIPLINAS);
  readonly items = this._items.asReadonly();

  readonly conPlanillaFutbol = computed(() =>
    this._items().filter((d) => d.tipoPlanilla === 'futbol')
  );

  getById(id: string): Disciplina | undefined {
    return this._items().find((d) => d.id === id);
  }

  create(item: Omit<Disciplina, 'id'>): void {
    this._items.update((items) => [...items, { ...item, id: crypto.randomUUID() }]);
  }

  update(id: string, changes: Partial<Disciplina>): void {
    this._items.update((items) => items.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  }

  delete(id: string): void {
    this._items.update((items) => items.filter((i) => i.id !== id));
  }

  addRegla(disciplinaId: string, regla: Omit<ReglaDisciplina, 'id' | 'disciplinaId'>): void {
    const newRegla: ReglaDisciplina = { ...regla, id: crypto.randomUUID(), disciplinaId };
    this._items.update((items) =>
      items.map((d) =>
        d.id === disciplinaId ? { ...d, reglas: [...d.reglas, newRegla] } : d
      )
    );
  }

  removeRegla(disciplinaId: string, reglaId: string): void {
    this._items.update((items) =>
      items.map((d) =>
        d.id === disciplinaId
          ? { ...d, reglas: d.reglas.filter((r) => r.id !== reglaId) }
          : d
      )
    );
  }
}
