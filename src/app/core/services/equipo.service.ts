import { Injectable, signal, computed } from '@angular/core';
import { Equipo, Participante, Transferencia, HistorialParticipante } from '../models/equipo.model';

const MOCK_EQUIPOS: Equipo[] = [
  {
    id: 'eq-1',
    nombre: 'Los Tigres',
    campeonatoId: 'camp-1',
    disciplinaId: 'disc-futbol',
    delegadoId: 'p-1',
    participantes: [
      { id: 'p-1', nombre: 'Carlos', apellido: 'García', dni: '30123456', tipo: 'socio', equipoId: 'eq-1', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 10, posicion: 'Mediocampista' },
      { id: 'p-2', nombre: 'Juan', apellido: 'Pérez', dni: '31234567', tipo: 'socio', equipoId: 'eq-1', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 9, posicion: 'Delantero', deudaPendiente: true },
      { id: 'p-3', nombre: 'Miguel', apellido: 'López', dni: '32345678', tipo: 'invitado', equipoId: 'eq-1', elegibilidad: 'elegible', fechaRegistro: '2026-02-20', numeroCamiseta: 1, posicion: 'Portero' },
      { id: 'p-100', nombre: 'Ramiro', apellido: 'Castillo', dni: '30111001', tipo: 'socio', equipoId: 'eq-1', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 2, posicion: 'Defensor' },
      { id: 'p-101', nombre: 'Esteban', apellido: 'Ríos', dni: '30111002', tipo: 'socio', equipoId: 'eq-1', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 4, posicion: 'Defensor' },
      { id: 'p-102', nombre: 'Oscar', apellido: 'Vera', dni: '30111003', tipo: 'socio', equipoId: 'eq-1', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 5, posicion: 'Defensor' },
      { id: 'p-103', nombre: 'Gustavo', apellido: 'Aguirre', dni: '30111004', tipo: 'socio', equipoId: 'eq-1', elegibilidad: 'elegible', fechaRegistro: '2026-02-16', numeroCamiseta: 6, posicion: 'Mediocampista', deudaPendiente: true },
      { id: 'p-104', nombre: 'Héctor', apellido: 'Ponce', dni: '30111005', tipo: 'socio', equipoId: 'eq-1', elegibilidad: 'elegible', fechaRegistro: '2026-02-16', numeroCamiseta: 7, posicion: 'Delantero' },
      { id: 'p-105', nombre: 'Leandro', apellido: 'Giménez', dni: '30111006', tipo: 'invitado', equipoId: 'eq-1', elegibilidad: 'elegible', fechaRegistro: '2026-02-20', numeroCamiseta: 11, posicion: 'Delantero' },
      { id: 'p-106', nombre: 'Mauro', apellido: 'Paz', dni: '30111007', tipo: 'socio', equipoId: 'eq-1', elegibilidad: 'suspendido', fechaRegistro: '2026-02-15', numeroCamiseta: 8, posicion: 'Mediocampista' },
      { id: 'p-107', nombre: 'Damián', apellido: 'Ojeda', dni: '30111008', tipo: 'socio', equipoId: 'eq-1', elegibilidad: 'elegible', fechaRegistro: '2026-02-17', numeroCamiseta: 3, posicion: 'Defensor' },
    ],
  },
  {
    id: 'eq-2',
    nombre: 'Las Águilas',
    campeonatoId: 'camp-1',
    disciplinaId: 'disc-futbol',
    delegadoId: 'p-4',
    participantes: [
      { id: 'p-4', nombre: 'Roberto', apellido: 'Martínez', dni: '33456789', tipo: 'socio', equipoId: 'eq-2', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 7, posicion: 'Delantero' },
      { id: 'p-5', nombre: 'Andrés', apellido: 'Rodríguez', dni: '34567890', tipo: 'socio', equipoId: 'eq-2', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 5, posicion: 'Defensor', deudaPendiente: true },
      { id: 'p-6', nombre: 'Diego', apellido: 'Fernández', dni: '35678901', tipo: 'socio', equipoId: 'eq-2', elegibilidad: 'suspendido', fechaRegistro: '2026-02-18', numeroCamiseta: 11, posicion: 'Mediocampista' },
      { id: 'p-110', nombre: 'Luciano', apellido: 'Bravo', dni: '33111001', tipo: 'socio', equipoId: 'eq-2', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 1, posicion: 'Portero' },
      { id: 'p-111', nombre: 'Franco', apellido: 'Salazar', dni: '33111002', tipo: 'socio', equipoId: 'eq-2', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 2, posicion: 'Defensor' },
      { id: 'p-112', nombre: 'Ignacio', apellido: 'Bustos', dni: '33111003', tipo: 'socio', equipoId: 'eq-2', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 4, posicion: 'Defensor' },
      { id: 'p-113', nombre: 'Maximiliano', apellido: 'Córdoba', dni: '33111004', tipo: 'socio', equipoId: 'eq-2', elegibilidad: 'elegible', fechaRegistro: '2026-02-16', numeroCamiseta: 6, posicion: 'Mediocampista' },
      { id: 'p-114', nombre: 'Valentín', apellido: 'Luna', dni: '33111005', tipo: 'invitado', equipoId: 'eq-2', elegibilidad: 'elegible', fechaRegistro: '2026-02-20', numeroCamiseta: 9, posicion: 'Delantero' },
      { id: 'p-115', nombre: 'Thiago', apellido: 'Peralta', dni: '33111006', tipo: 'socio', equipoId: 'eq-2', elegibilidad: 'elegible', fechaRegistro: '2026-02-16', numeroCamiseta: 10, posicion: 'Mediocampista' },
      { id: 'p-116', nombre: 'Agustín', apellido: 'Soria', dni: '33111007', tipo: 'socio', equipoId: 'eq-2', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 3, posicion: 'Defensor' },
    ],
  },
  {
    id: 'eq-3',
    nombre: 'Los Delfines',
    campeonatoId: 'camp-1',
    disciplinaId: 'disc-futbol',
    participantes: [
      { id: 'p-7', nombre: 'Luis', apellido: 'Sánchez', dni: '36789012', tipo: 'socio', equipoId: 'eq-3', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 8, posicion: 'Mediocampista' },
      { id: 'p-8', nombre: 'Pedro', apellido: 'Gómez', dni: '37890123', tipo: 'invitado', equipoId: 'eq-3', elegibilidad: 'elegible', fechaRegistro: '2026-02-20', numeroCamiseta: 3, posicion: 'Defensor', deudaPendiente: true },
      { id: 'p-120', nombre: 'Marcos', apellido: 'Cabrera', dni: '36111001', tipo: 'socio', equipoId: 'eq-3', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 1, posicion: 'Portero' },
      { id: 'p-121', nombre: 'Brian', apellido: 'Figueroa', dni: '36111002', tipo: 'socio', equipoId: 'eq-3', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 2, posicion: 'Defensor' },
      { id: 'p-122', nombre: 'Kevin', apellido: 'Romero', dni: '36111003', tipo: 'socio', equipoId: 'eq-3', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 4, posicion: 'Defensor' },
      { id: 'p-123', nombre: 'Alan', apellido: 'Mansilla', dni: '36111004', tipo: 'socio', equipoId: 'eq-3', elegibilidad: 'elegible', fechaRegistro: '2026-02-16', numeroCamiseta: 5, posicion: 'Defensor' },
      { id: 'p-124', nombre: 'Ezequiel', apellido: 'Leiva', dni: '36111005', tipo: 'socio', equipoId: 'eq-3', elegibilidad: 'elegible', fechaRegistro: '2026-02-16', numeroCamiseta: 6, posicion: 'Mediocampista' },
      { id: 'p-125', nombre: 'Gonzalo', apellido: 'Benítez', dni: '36111006', tipo: 'socio', equipoId: 'eq-3', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 9, posicion: 'Delantero' },
      { id: 'p-126', nombre: 'Lautaro', apellido: 'Villalba', dni: '36111007', tipo: 'invitado', equipoId: 'eq-3', elegibilidad: 'elegible', fechaRegistro: '2026-02-20', numeroCamiseta: 10, posicion: 'Mediocampista' },
    ],
  },
  {
    id: 'eq-4',
    nombre: 'Los Halcones',
    campeonatoId: 'camp-1',
    disciplinaId: 'disc-futbol',
    participantes: [
      { id: 'p-9', nombre: 'Fernando', apellido: 'Díaz', dni: '38901234', tipo: 'socio', equipoId: 'eq-4', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 6, posicion: 'Mediocampista', deudaPendiente: true },
      { id: 'p-10', nombre: 'Sergio', apellido: 'Torres', dni: '39012345', tipo: 'socio', equipoId: 'eq-4', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 2, posicion: 'Defensor' },
      { id: 'p-130', nombre: 'Adrián', apellido: 'Quiroga', dni: '38111001', tipo: 'socio', equipoId: 'eq-4', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 1, posicion: 'Portero' },
      { id: 'p-131', nombre: 'Rodrigo', apellido: 'Cáceres', dni: '38111002', tipo: 'socio', equipoId: 'eq-4', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 3, posicion: 'Defensor' },
      { id: 'p-132', nombre: 'Emanuel', apellido: 'Flores', dni: '38111003', tipo: 'socio', equipoId: 'eq-4', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 4, posicion: 'Defensor' },
      { id: 'p-133', nombre: 'Santiago', apellido: 'Ibarra', dni: '38111004', tipo: 'socio', equipoId: 'eq-4', elegibilidad: 'elegible', fechaRegistro: '2026-02-16', numeroCamiseta: 5, posicion: 'Defensor' },
      { id: 'p-134', nombre: 'Nicolás', apellido: 'Roldán', dni: '38111005', tipo: 'socio', equipoId: 'eq-4', elegibilidad: 'elegible', fechaRegistro: '2026-02-16', numeroCamiseta: 7, posicion: 'Mediocampista' },
      { id: 'p-135', nombre: 'Mateo', apellido: 'Escobar', dni: '38111006', tipo: 'socio', equipoId: 'eq-4', elegibilidad: 'elegible', fechaRegistro: '2026-02-15', numeroCamiseta: 9, posicion: 'Delantero' },
      { id: 'p-136', nombre: 'Tobías', apellido: 'Miranda', dni: '38111007', tipo: 'invitado', equipoId: 'eq-4', elegibilidad: 'elegible', fechaRegistro: '2026-02-20', numeroCamiseta: 11, posicion: 'Delantero' },
      { id: 'p-137', nombre: 'Julián', apellido: 'Arias', dni: '38111008', tipo: 'socio', equipoId: 'eq-4', elegibilidad: 'suspendido', fechaRegistro: '2026-02-15', numeroCamiseta: 8, posicion: 'Mediocampista' },
    ],
  },
  // ── camp-3 (finalizado, disc-futbol) ──
  {
    id: 'eq-5',
    nombre: 'Los Leones',
    campeonatoId: 'camp-3',
    disciplinaId: 'disc-futbol',
    delegadoId: 'p-11',
    participantes: [
      { id: 'p-11', nombre: 'Raúl', apellido: 'Morales', dni: '40123456', tipo: 'socio', equipoId: 'eq-5', elegibilidad: 'elegible', fechaRegistro: '2025-06-01', numeroCamiseta: 10, posicion: 'Mediocampista' },
      { id: 'p-12', nombre: 'Hugo', apellido: 'Vargas', dni: '41234567', tipo: 'socio', equipoId: 'eq-5', elegibilidad: 'elegible', fechaRegistro: '2025-06-01', numeroCamiseta: 9, posicion: 'Delantero' },
      { id: 'p-140', nombre: 'Abel', apellido: 'Contreras', dni: '40111001', tipo: 'socio', equipoId: 'eq-5', elegibilidad: 'elegible', fechaRegistro: '2025-06-01', numeroCamiseta: 1, posicion: 'Portero' },
      { id: 'p-141', nombre: 'Dante', apellido: 'Ramos', dni: '40111002', tipo: 'socio', equipoId: 'eq-5', elegibilidad: 'elegible', fechaRegistro: '2025-06-01', numeroCamiseta: 2, posicion: 'Defensor' },
      { id: 'p-142', nombre: 'Joel', apellido: 'Méndez', dni: '40111003', tipo: 'socio', equipoId: 'eq-5', elegibilidad: 'elegible', fechaRegistro: '2025-06-01', numeroCamiseta: 4, posicion: 'Defensor' },
      { id: 'p-143', nombre: 'Ariel', apellido: 'Sosa', dni: '40111004', tipo: 'socio', equipoId: 'eq-5', elegibilidad: 'elegible', fechaRegistro: '2025-06-02', numeroCamiseta: 5, posicion: 'Defensor' },
      { id: 'p-144', nombre: 'Lisandro', apellido: 'Vega', dni: '40111005', tipo: 'socio', equipoId: 'eq-5', elegibilidad: 'elegible', fechaRegistro: '2025-06-02', numeroCamiseta: 6, posicion: 'Mediocampista' },
      { id: 'p-145', nombre: 'Federico', apellido: 'Blanco', dni: '40111006', tipo: 'invitado', equipoId: 'eq-5', elegibilidad: 'elegible', fechaRegistro: '2025-06-05', numeroCamiseta: 7, posicion: 'Mediocampista' },
      { id: 'p-146', nombre: 'Claudio', apellido: 'Navarro', dni: '40111007', tipo: 'socio', equipoId: 'eq-5', elegibilidad: 'elegible', fechaRegistro: '2025-06-01', numeroCamiseta: 11, posicion: 'Delantero' },
    ],
  },
  {
    id: 'eq-6',
    nombre: 'Los Pumas',
    campeonatoId: 'camp-3',
    disciplinaId: 'disc-futbol',
    delegadoId: 'p-13',
    participantes: [
      { id: 'p-13', nombre: 'Javier', apellido: 'Ríos', dni: '42345678', tipo: 'socio', equipoId: 'eq-6', elegibilidad: 'elegible', fechaRegistro: '2025-06-01', numeroCamiseta: 7, posicion: 'Delantero' },
      { id: 'p-14', nombre: 'Tomás', apellido: 'Herrera', dni: '43456789', tipo: 'socio', equipoId: 'eq-6', elegibilidad: 'elegible', fechaRegistro: '2025-06-01', numeroCamiseta: 4, posicion: 'Defensor' },
      { id: 'p-150', nombre: 'Maximiliano', apellido: 'Paz', dni: '42111001', tipo: 'socio', equipoId: 'eq-6', elegibilidad: 'elegible', fechaRegistro: '2025-06-01', numeroCamiseta: 1, posicion: 'Portero' },
      { id: 'p-151', nombre: 'Nahuel', apellido: 'Gutiérrez', dni: '42111002', tipo: 'socio', equipoId: 'eq-6', elegibilidad: 'elegible', fechaRegistro: '2025-06-01', numeroCamiseta: 2, posicion: 'Defensor' },
      { id: 'p-152', nombre: 'Bruno', apellido: 'Toledo', dni: '42111003', tipo: 'socio', equipoId: 'eq-6', elegibilidad: 'elegible', fechaRegistro: '2025-06-01', numeroCamiseta: 5, posicion: 'Defensor' },
      { id: 'p-153', nombre: 'Alfredo', apellido: 'Lagos', dni: '42111004', tipo: 'socio', equipoId: 'eq-6', elegibilidad: 'elegible', fechaRegistro: '2025-06-02', numeroCamiseta: 6, posicion: 'Mediocampista' },
      { id: 'p-154', nombre: 'Simón', apellido: 'Cruz', dni: '42111005', tipo: 'socio', equipoId: 'eq-6', elegibilidad: 'elegible', fechaRegistro: '2025-06-02', numeroCamiseta: 8, posicion: 'Mediocampista' },
      { id: 'p-155', nombre: 'Omar', apellido: 'Duarte', dni: '42111006', tipo: 'invitado', equipoId: 'eq-6', elegibilidad: 'elegible', fechaRegistro: '2025-06-05', numeroCamiseta: 9, posicion: 'Delantero' },
      { id: 'p-156', nombre: 'Ramón', apellido: 'Fuentes', dni: '42111007', tipo: 'socio', equipoId: 'eq-6', elegibilidad: 'suspendido', fechaRegistro: '2025-06-01', numeroCamiseta: 10, posicion: 'Mediocampista' },
    ],
  },
  {
    id: 'eq-7',
    nombre: 'Los Cóndores',
    campeonatoId: 'camp-3',
    disciplinaId: 'disc-futbol',
    participantes: [
      { id: 'p-15', nombre: 'Gabriel', apellido: 'Castro', dni: '44567890', tipo: 'socio', equipoId: 'eq-7', elegibilidad: 'elegible', fechaRegistro: '2025-06-02', numeroCamiseta: 1, posicion: 'Portero' },
      { id: 'p-16', nombre: 'Matías', apellido: 'Ortega', dni: '45678901', tipo: 'socio', equipoId: 'eq-7', elegibilidad: 'elegible', fechaRegistro: '2025-06-02', numeroCamiseta: 5, posicion: 'Defensor' },
      { id: 'p-160', nombre: 'Joaquín', apellido: 'Álvarez', dni: '44111001', tipo: 'socio', equipoId: 'eq-7', elegibilidad: 'elegible', fechaRegistro: '2025-06-02', numeroCamiseta: 2, posicion: 'Defensor' },
      { id: 'p-161', nombre: 'Lorenzo', apellido: 'Donato', dni: '44111002', tipo: 'socio', equipoId: 'eq-7', elegibilidad: 'elegible', fechaRegistro: '2025-06-02', numeroCamiseta: 4, posicion: 'Defensor' },
      { id: 'p-162', nombre: 'Facundo', apellido: 'Muñoz', dni: '44111003', tipo: 'socio', equipoId: 'eq-7', elegibilidad: 'elegible', fechaRegistro: '2025-06-02', numeroCamiseta: 6, posicion: 'Mediocampista' },
      { id: 'p-163', nombre: 'Benjamín', apellido: 'Coria', dni: '44111004', tipo: 'socio', equipoId: 'eq-7', elegibilidad: 'elegible', fechaRegistro: '2025-06-03', numeroCamiseta: 7, posicion: 'Mediocampista' },
      { id: 'p-164', nombre: 'Tomás', apellido: 'Maldonado', dni: '44111005', tipo: 'socio', equipoId: 'eq-7', elegibilidad: 'elegible', fechaRegistro: '2025-06-03', numeroCamiseta: 9, posicion: 'Delantero' },
      { id: 'p-165', nombre: 'Iván', apellido: 'Godoy', dni: '44111006', tipo: 'invitado', equipoId: 'eq-7', elegibilidad: 'elegible', fechaRegistro: '2025-06-05', numeroCamiseta: 10, posicion: 'Mediocampista' },
    ],
  },
  {
    id: 'eq-8',
    nombre: 'Las Panteras',
    campeonatoId: 'camp-3',
    disciplinaId: 'disc-futbol',
    participantes: [
      { id: 'p-17', nombre: 'Nicolás', apellido: 'Medina', dni: '46789012', tipo: 'socio', equipoId: 'eq-8', elegibilidad: 'elegible', fechaRegistro: '2025-06-02', numeroCamiseta: 8, posicion: 'Mediocampista' },
      { id: 'p-18', nombre: 'Emilio', apellido: 'Suárez', dni: '47890123', tipo: 'invitado', equipoId: 'eq-8', elegibilidad: 'elegible', fechaRegistro: '2025-06-05', numeroCamiseta: 11, posicion: 'Delantero' },
      { id: 'p-170', nombre: 'Patricio', apellido: 'Acuña', dni: '46111001', tipo: 'socio', equipoId: 'eq-8', elegibilidad: 'elegible', fechaRegistro: '2025-06-02', numeroCamiseta: 1, posicion: 'Portero' },
      { id: 'p-171', nombre: 'Renato', apellido: 'Oliva', dni: '46111002', tipo: 'socio', equipoId: 'eq-8', elegibilidad: 'elegible', fechaRegistro: '2025-06-02', numeroCamiseta: 2, posicion: 'Defensor' },
      { id: 'p-172', nombre: 'Lucas', apellido: 'Valdez', dni: '46111003', tipo: 'socio', equipoId: 'eq-8', elegibilidad: 'elegible', fechaRegistro: '2025-06-02', numeroCamiseta: 3, posicion: 'Defensor' },
      { id: 'p-173', nombre: 'Germán', apellido: 'Quiroz', dni: '46111004', tipo: 'socio', equipoId: 'eq-8', elegibilidad: 'elegible', fechaRegistro: '2025-06-02', numeroCamiseta: 5, posicion: 'Defensor' },
      { id: 'p-174', nombre: 'Fabián', apellido: 'Montoya', dni: '46111005', tipo: 'socio', equipoId: 'eq-8', elegibilidad: 'elegible', fechaRegistro: '2025-06-03', numeroCamiseta: 6, posicion: 'Mediocampista' },
      { id: 'p-175', nombre: 'Cristóbal', apellido: 'Serrano', dni: '46111006', tipo: 'socio', equipoId: 'eq-8', elegibilidad: 'elegible', fechaRegistro: '2025-06-03', numeroCamiseta: 9, posicion: 'Delantero' },
      { id: 'p-176', nombre: 'Rafael', apellido: 'Peña', dni: '46111007', tipo: 'socio', equipoId: 'eq-8', elegibilidad: 'elegible', fechaRegistro: '2025-06-02', numeroCamiseta: 10, posicion: 'Mediocampista' },
    ],
  },
  // ── camp-6 (en_ejecucion, disc-basquet) ──
  {
    id: 'eq-9',
    nombre: 'Los Cometas',
    campeonatoId: 'camp-6',
    disciplinaId: 'disc-basquet',
    delegadoId: 'p-19',
    participantes: [
      { id: 'p-19', nombre: 'Alejandro', apellido: 'Ruiz', dni: '48901234', tipo: 'socio', equipoId: 'eq-9', elegibilidad: 'elegible', fechaRegistro: '2025-09-01', numeroCamiseta: 4, posicion: 'Base' },
      { id: 'p-20', nombre: 'Daniel', apellido: 'Vega', dni: '49012345', tipo: 'socio', equipoId: 'eq-9', elegibilidad: 'elegible', fechaRegistro: '2025-09-01', numeroCamiseta: 15, posicion: 'Pívot' },
      { id: 'p-180', nombre: 'Hernán', apellido: 'Paz', dni: '48111001', tipo: 'socio', equipoId: 'eq-9', elegibilidad: 'elegible', fechaRegistro: '2025-09-01', numeroCamiseta: 5, posicion: 'Escolta' },
      { id: 'p-181', nombre: 'Gonzalo', apellido: 'Franco', dni: '48111002', tipo: 'socio', equipoId: 'eq-9', elegibilidad: 'elegible', fechaRegistro: '2025-09-01', numeroCamiseta: 7, posicion: 'Alero' },
      { id: 'p-182', nombre: 'Enzo', apellido: 'Costa', dni: '48111003', tipo: 'socio', equipoId: 'eq-9', elegibilidad: 'elegible', fechaRegistro: '2025-09-01', numeroCamiseta: 10, posicion: 'Ala-Pívot' },
      { id: 'p-183', nombre: 'Julián', apellido: 'Campos', dni: '48111004', tipo: 'socio', equipoId: 'eq-9', elegibilidad: 'elegible', fechaRegistro: '2025-09-02', numeroCamiseta: 11, posicion: 'Base' },
      { id: 'p-184', nombre: 'Agustín', apellido: 'Olvera', dni: '48111005', tipo: 'invitado', equipoId: 'eq-9', elegibilidad: 'elegible', fechaRegistro: '2025-09-05', numeroCamiseta: 23, posicion: 'Alero' },
      { id: 'p-185', nombre: 'Tadeo', apellido: 'Carrizo', dni: '48111006', tipo: 'socio', equipoId: 'eq-9', elegibilidad: 'elegible', fechaRegistro: '2025-09-01', numeroCamiseta: 33, posicion: 'Pívot' },
    ],
  },
  {
    id: 'eq-10',
    nombre: 'Las Estrellas',
    campeonatoId: 'camp-6',
    disciplinaId: 'disc-basquet',
    delegadoId: 'p-21',
    participantes: [
      { id: 'p-21', nombre: 'Pablo', apellido: 'Navarro', dni: '50123456', tipo: 'socio', equipoId: 'eq-10', elegibilidad: 'elegible', fechaRegistro: '2025-09-01', numeroCamiseta: 7, posicion: 'Escolta' },
      { id: 'p-22', nombre: 'Martín', apellido: 'Acosta', dni: '51234567', tipo: 'socio', equipoId: 'eq-10', elegibilidad: 'elegible', fechaRegistro: '2025-09-01', numeroCamiseta: 23, posicion: 'Alero' },
      { id: 'p-190', nombre: 'Diego', apellido: 'Salinas', dni: '50111001', tipo: 'socio', equipoId: 'eq-10', elegibilidad: 'elegible', fechaRegistro: '2025-09-01', numeroCamiseta: 1, posicion: 'Base' },
      { id: 'p-191', nombre: 'Ramiro', apellido: 'Heredia', dni: '50111002', tipo: 'socio', equipoId: 'eq-10', elegibilidad: 'elegible', fechaRegistro: '2025-09-01', numeroCamiseta: 4, posicion: 'Escolta' },
      { id: 'p-192', nombre: 'Tomás', apellido: 'Barrios', dni: '50111003', tipo: 'socio', equipoId: 'eq-10', elegibilidad: 'elegible', fechaRegistro: '2025-09-01', numeroCamiseta: 10, posicion: 'Alero' },
      { id: 'p-193', nombre: 'Facundo', apellido: 'Cisneros', dni: '50111004', tipo: 'socio', equipoId: 'eq-10', elegibilidad: 'elegible', fechaRegistro: '2025-09-02', numeroCamiseta: 15, posicion: 'Ala-Pívot' },
      { id: 'p-194', nombre: 'Nicolás', apellido: 'Godoy', dni: '50111005', tipo: 'socio', equipoId: 'eq-10', elegibilidad: 'elegible', fechaRegistro: '2025-09-02', numeroCamiseta: 32, posicion: 'Pívot' },
      { id: 'p-195', nombre: 'Luca', apellido: 'Peñaloza', dni: '50111006', tipo: 'invitado', equipoId: 'eq-10', elegibilidad: 'elegible', fechaRegistro: '2025-09-05', numeroCamiseta: 5, posicion: 'Base' },
    ],
  },
  // ── camp-12 (en_ejecucion, disc-futbol) ──
  {
    id: 'eq-11',
    nombre: 'Los Rayos',
    campeonatoId: 'camp-12',
    disciplinaId: 'disc-futbol',
    delegadoId: 'p-23',
    participantes: [
      { id: 'p-23', nombre: 'Iván', apellido: 'Molina', dni: '52345678', tipo: 'socio', equipoId: 'eq-11', elegibilidad: 'elegible', fechaRegistro: '2026-05-01', numeroCamiseta: 10, posicion: 'Mediocampista' },
      { id: 'p-24', nombre: 'Sebastián', apellido: 'Paredes', dni: '53456789', tipo: 'socio', equipoId: 'eq-11', elegibilidad: 'elegible', fechaRegistro: '2026-05-01', numeroCamiseta: 9, posicion: 'Delantero' },
      { id: 'p-200', nombre: 'Lucio', apellido: 'Garay', dni: '52111001', tipo: 'socio', equipoId: 'eq-11', elegibilidad: 'elegible', fechaRegistro: '2026-05-01', numeroCamiseta: 1, posicion: 'Portero' },
      { id: 'p-201', nombre: 'Bautista', apellido: 'Linares', dni: '52111002', tipo: 'socio', equipoId: 'eq-11', elegibilidad: 'elegible', fechaRegistro: '2026-05-01', numeroCamiseta: 2, posicion: 'Defensor' },
      { id: 'p-202', nombre: 'Santino', apellido: 'Meza', dni: '52111003', tipo: 'socio', equipoId: 'eq-11', elegibilidad: 'elegible', fechaRegistro: '2026-05-01', numeroCamiseta: 4, posicion: 'Defensor' },
      { id: 'p-203', nombre: 'Ciro', apellido: 'Gallegos', dni: '52111004', tipo: 'socio', equipoId: 'eq-11', elegibilidad: 'elegible', fechaRegistro: '2026-05-02', numeroCamiseta: 5, posicion: 'Defensor' },
      { id: 'p-204', nombre: 'Valentino', apellido: 'Coronel', dni: '52111005', tipo: 'socio', equipoId: 'eq-11', elegibilidad: 'elegible', fechaRegistro: '2026-05-02', numeroCamiseta: 6, posicion: 'Mediocampista' },
      { id: 'p-205', nombre: 'Benicio', apellido: 'Araya', dni: '52111006', tipo: 'invitado', equipoId: 'eq-11', elegibilidad: 'elegible', fechaRegistro: '2026-05-05', numeroCamiseta: 7, posicion: 'Mediocampista' },
      { id: 'p-206', nombre: 'Gael', apellido: 'Leguizamón', dni: '52111007', tipo: 'socio', equipoId: 'eq-11', elegibilidad: 'elegible', fechaRegistro: '2026-05-01', numeroCamiseta: 11, posicion: 'Delantero' },
    ],
  },
  {
    id: 'eq-12',
    nombre: 'Los Truenos',
    campeonatoId: 'camp-12',
    disciplinaId: 'disc-futbol',
    delegadoId: 'p-25',
    participantes: [
      { id: 'p-25', nombre: 'Cristian', apellido: 'Luna', dni: '54567890', tipo: 'socio', equipoId: 'eq-12', elegibilidad: 'elegible', fechaRegistro: '2026-05-01', numeroCamiseta: 7, posicion: 'Delantero' },
      { id: 'p-26', nombre: 'Facundo', apellido: 'Rojas', dni: '55678901', tipo: 'socio', equipoId: 'eq-12', elegibilidad: 'elegible', fechaRegistro: '2026-05-01', numeroCamiseta: 3, posicion: 'Defensor' },
      { id: 'p-210', nombre: 'Máximo', apellido: 'Ibáñez', dni: '54111001', tipo: 'socio', equipoId: 'eq-12', elegibilidad: 'elegible', fechaRegistro: '2026-05-01', numeroCamiseta: 1, posicion: 'Portero' },
      { id: 'p-211', nombre: 'León', apellido: 'Pizarro', dni: '54111002', tipo: 'socio', equipoId: 'eq-12', elegibilidad: 'elegible', fechaRegistro: '2026-05-01', numeroCamiseta: 2, posicion: 'Defensor' },
      { id: 'p-212', nombre: 'Felipe', apellido: 'Cardozo', dni: '54111003', tipo: 'socio', equipoId: 'eq-12', elegibilidad: 'elegible', fechaRegistro: '2026-05-01', numeroCamiseta: 4, posicion: 'Defensor' },
      { id: 'p-213', nombre: 'Salvador', apellido: 'Ledesma', dni: '54111004', tipo: 'socio', equipoId: 'eq-12', elegibilidad: 'elegible', fechaRegistro: '2026-05-02', numeroCamiseta: 6, posicion: 'Mediocampista' },
      { id: 'p-214', nombre: 'Elías', apellido: 'Barreto', dni: '54111005', tipo: 'socio', equipoId: 'eq-12', elegibilidad: 'elegible', fechaRegistro: '2026-05-02', numeroCamiseta: 8, posicion: 'Mediocampista' },
      { id: 'p-215', nombre: 'Ulises', apellido: 'Sepúlveda', dni: '54111006', tipo: 'invitado', equipoId: 'eq-12', elegibilidad: 'elegible', fechaRegistro: '2026-05-05', numeroCamiseta: 9, posicion: 'Delantero' },
      { id: 'p-216', nombre: 'Camilo', apellido: 'Villalobos', dni: '54111007', tipo: 'socio', equipoId: 'eq-12', elegibilidad: 'suspendido', fechaRegistro: '2026-05-01', numeroCamiseta: 10, posicion: 'Mediocampista' },
    ],
  },
];

const MOCK_TRANSFERENCIAS: Transferencia[] = [];

const MOCK_HISTORIAL: HistorialParticipante[] = [
  { id: 'h-1', participanteId: 'p-2', campeonatoId: 'camp-1', equipoId: 'eq-1', temporada: '2025', goles: 12, tarjetasAmarillas: 3, tarjetasRojas: 0, partidosJugados: 18 },
  { id: 'h-2', participanteId: 'p-4', campeonatoId: 'camp-1', equipoId: 'eq-2', temporada: '2025', goles: 8, tarjetasAmarillas: 1, tarjetasRojas: 1, partidosJugados: 16 },
];

@Injectable({ providedIn: 'root' })
export class EquipoService {
  private readonly _equipos = signal<Equipo[]>(MOCK_EQUIPOS);
  private readonly _transferencias = signal<Transferencia[]>(MOCK_TRANSFERENCIAS);
  private readonly _historial = signal<HistorialParticipante[]>(MOCK_HISTORIAL);

  readonly equipos = this._equipos.asReadonly();
  readonly transferencias = this._transferencias.asReadonly();
  readonly historial = this._historial.asReadonly();

  getEquipoById(id: string): Equipo | undefined {
    return this._equipos().find((e) => e.id === id);
  }

  getEquiposByCampeonato(campeonatoId: string): Equipo[] {
    return this._equipos().filter((e) => e.campeonatoId === campeonatoId);
  }

  getEquiposByDisciplina(disciplinaId: string): Equipo[] {
    return this._equipos().filter((e) => e.disciplinaId === disciplinaId);
  }

  getParticipante(id: string): Participante | undefined {
    for (const equipo of this._equipos()) {
      const p = equipo.participantes.find((par) => par.id === id);
      if (p) return p;
    }
    return undefined;
  }

  getAllParticipantes(): Participante[] {
    return this._equipos().flatMap((e) => e.participantes);
  }

  createEquipo(item: Omit<Equipo, 'id' | 'participantes'>): void {
    this._equipos.update((items) => [
      ...items,
      { ...item, id: crypto.randomUUID(), participantes: [] },
    ]);
  }

  updateEquipo(id: string, changes: Partial<Omit<Equipo, 'participantes'>>): void {
    this._equipos.update((items) =>
      items.map((i) => (i.id === id ? { ...i, ...changes } : i))
    );
  }

  deleteEquipo(id: string): void {
    this._equipos.update((items) => items.filter((i) => i.id !== id));
  }

  addParticipante(equipoId: string, participante: Omit<Participante, 'id' | 'equipoId'>): void {
    const newP: Participante = { ...participante, id: crypto.randomUUID(), equipoId };
    this._equipos.update((items) =>
      items.map((e) =>
        e.id === equipoId ? { ...e, participantes: [...e.participantes, newP] } : e
      )
    );
  }

  updateParticipante(equipoId: string, participanteId: string, changes: Partial<Participante>): void {
    this._equipos.update((items) =>
      items.map((e) =>
        e.id === equipoId
          ? {
              ...e,
              participantes: e.participantes.map((p) =>
                p.id === participanteId ? { ...p, ...changes } : p
              ),
            }
          : e
      )
    );
  }

  removeParticipante(equipoId: string, participanteId: string): void {
    this._equipos.update((items) =>
      items.map((e) =>
        e.id === equipoId
          ? { ...e, participantes: e.participantes.filter((p) => p.id !== participanteId) }
          : e
      )
    );
  }

  createTransferencia(t: Omit<Transferencia, 'id'>): void {
    this._transferencias.update((items) => [...items, { ...t, id: crypto.randomUUID() }]);
  }

  getHistorialByParticipante(participanteId: string): HistorialParticipante[] {
    return this._historial().filter((h) => h.participanteId === participanteId);
  }
}
