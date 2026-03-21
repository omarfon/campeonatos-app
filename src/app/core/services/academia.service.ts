import { Injectable, signal, computed } from '@angular/core';
import {
  Rubro,
  CategoriaAcademica,
  SubcategoriaAcademica,
  Curso,
  CategoriaEdad,
  NivelHabilidad,
  Docente,
  Ambiente,
  Clase,
  Programa,
  BloqueoInstitucional,
  ValidacionProgramacionClaseResultado,
  HorarioClase,
  SesionProgramadaClase,
} from '../models/academia.model';

// ──── Mock: Rubros (Nivel 1) ────

const MOCK_RUBROS: Rubro[] = [
  { id: 'rub-dep', nombre: 'Cursos Deportivos', tipo: 'deportivo', descripcion: 'Actividades deportivas y de acondicionamiento físico', orden: 1 },
  { id: 'rub-mus', nombre: 'Cursos de Música', tipo: 'musica', descripcion: 'Formación musical e instrumental', orden: 2 },
  { id: 'rub-cul', nombre: 'Cursos Culturales', tipo: 'cultural', descripcion: 'Artes, danza, idiomas y expresión cultural', orden: 3 },
  { id: 'rub-tec', nombre: 'Cursos de Tecnología', tipo: 'tecnologia', descripcion: 'Programación, diseño y tecnología aplicada', orden: 4 },
];

// ──── Mock: Categorías (Nivel 2) ────

const MOCK_CATEGORIAS: CategoriaAcademica[] = [
  { id: 'cat-acuat', rubroId: 'rub-dep', nombre: 'Deportes Acuáticos', descripcion: 'Natación y deportes de agua', orden: 1 },
  { id: 'cat-marc', rubroId: 'rub-dep', nombre: 'Artes Marciales', descripcion: 'Disciplinas de combate y defensa', orden: 2 },
  { id: 'cat-equipo', rubroId: 'rub-dep', nombre: 'Deportes de Equipo', descripcion: 'Deportes colectivos', orden: 3 },
  { id: 'cat-cuerda', rubroId: 'rub-mus', nombre: 'Instrumentos de Cuerda', descripcion: 'Guitarra, violín, etc.', orden: 1 },
  { id: 'cat-viento', rubroId: 'rub-mus', nombre: 'Instrumentos de Viento', descripcion: 'Flauta, saxofón, etc.', orden: 2 },
  { id: 'cat-canto', rubroId: 'rub-mus', nombre: 'Canto', descripcion: 'Técnica vocal y coro', orden: 3 },
  { id: 'cat-danza', rubroId: 'rub-cul', nombre: 'Danza', descripcion: 'Todas las expresiones de danza', orden: 1 },
  { id: 'cat-idiom', rubroId: 'rub-cul', nombre: 'Idiomas', descripcion: 'Aprendizaje de lenguas extranjeras', orden: 2 },
  { id: 'cat-artes', rubroId: 'rub-cul', nombre: 'Artes Plásticas', descripcion: 'Pintura, escultura y artes visuales', orden: 3 },
  { id: 'cat-prog', rubroId: 'rub-tec', nombre: 'Programación', descripcion: 'Desarrollo de software', orden: 1 },
  { id: 'cat-diseno', rubroId: 'rub-tec', nombre: 'Diseño', descripcion: 'Diseño gráfico y UX', orden: 2 },
];

// ──── Mock: Subcategorías ────

const MOCK_SUBCATEGORIAS: SubcategoriaAcademica[] = [
  { id: 'sub-dmod', categoriaId: 'cat-danza', nombre: 'Danza Moderna', orden: 1 },
  { id: 'sub-dclas', categoriaId: 'cat-danza', nombre: 'Danza Clásica', orden: 2 },
  { id: 'sub-durb', categoriaId: 'cat-danza', nombre: 'Danza Urbana', orden: 3 },
  { id: 'sub-karate', categoriaId: 'cat-marc', nombre: 'Karate', orden: 1 },
  { id: 'sub-judo', categoriaId: 'cat-marc', nombre: 'Judo', orden: 2 },
  { id: 'sub-tkd', categoriaId: 'cat-marc', nombre: 'Taekwondo', orden: 3 },
];

// ──── Mock: Cursos (Nivel 3) ────

const MOCK_CURSOS: Curso[] = [
  {
    id: 'cur-natacion', codigo: 'DEP-001', nombre: 'Natación', descripcion: 'Clases de natación para todos los niveles con técnicas de estilo libre, espalda, pecho y mariposa.',
    objetivos: 'Desarrollar habilidades acuáticas, mejorar la técnica de nado y fomentar la seguridad en el agua.',
    rubroId: 'rub-dep', categoriaId: 'cat-acuat',
    publicoObjetivo: 'Niños, jóvenes y adultos interesados en aprender o perfeccionar natación',
    requiereCertificadoMedico: true, edadCertificadoMedico: 45,
    requiereDeclaracionJurada: true, manejaLevels: true,
    tipoNomenclaturaNivel: 'general', estado: 'activo',
  },
  {
    id: 'cur-karate', codigo: 'DEP-010', nombre: 'Karate Tradicional', descripcion: 'Arte marcial japonés enfocado en kata, kumite y defensa personal.',
    objetivos: 'Desarrollar disciplina, técnica de combate y valores del budo japonés.',
    rubroId: 'rub-dep', categoriaId: 'cat-marc', subcategoriaId: 'sub-karate',
    publicoObjetivo: 'Todas las edades',
    requiereCertificadoMedico: true, edadCertificadoMedico: 45,
    requiereDeclaracionJurada: true, manejaLevels: true,
    tipoNomenclaturaNivel: 'artes_marciales', estado: 'activo',
  },
  {
    id: 'cur-futbol', codigo: 'DEP-020', nombre: 'Fútbol', descripcion: 'Escuela de fútbol con formación técnica, táctica y competitiva.',
    objetivos: 'Mejorar las habilidades futbolísticas y promover el trabajo en equipo.',
    rubroId: 'rub-dep', categoriaId: 'cat-equipo',
    publicoObjetivo: 'Niños y jóvenes de 6 a 18 años',
    requiereCertificadoMedico: false,
    requiereDeclaracionJurada: false, manejaLevels: true,
    tipoNomenclaturaNivel: 'general', estado: 'activo',
  },
  {
    id: 'cur-guitarra', codigo: 'MUS-001', nombre: 'Guitarra Acústica', descripcion: 'Aprendizaje de guitarra acústica desde lectura musical hasta interpretación.',
    objetivos: 'Dominar la guitarra acústica en diversos estilos musicales.',
    rubroId: 'rub-mus', categoriaId: 'cat-cuerda',
    publicoObjetivo: 'Jóvenes y adultos',
    requiereCertificadoMedico: false,
    requiereDeclaracionJurada: false, manejaLevels: true,
    tipoNomenclaturaNivel: 'cultural_idiomas', estado: 'activo',
  },
  {
    id: 'cur-ballet', codigo: 'CUL-001', nombre: 'Ballet', descripcion: 'Formación en ballet clásico con técnica, expresión corporal y repertorio.',
    objetivos: 'Desarrollar la técnica del ballet clásico, la postura y la musicalidad.',
    rubroId: 'rub-cul', categoriaId: 'cat-danza', subcategoriaId: 'sub-dclas',
    publicoObjetivo: 'Niños y jóvenes de 5 a 18 años',
    requiereCertificadoMedico: false,
    requiereDeclaracionJurada: false, manejaLevels: true,
    tipoNomenclaturaNivel: 'general', estado: 'activo',
  },
  {
    id: 'cur-ingles', codigo: 'CUL-010', nombre: 'Inglés', descripcion: 'Curso de inglés con enfoque comunicativo y preparación para certificaciones internacionales.',
    objetivos: 'Lograr competencia comunicativa en inglés según el marco CEFR.',
    rubroId: 'rub-cul', categoriaId: 'cat-idiom',
    publicoObjetivo: 'Jóvenes y adultos',
    requiereCertificadoMedico: false,
    requiereDeclaracionJurada: false, manejaLevels: true,
    tipoNomenclaturaNivel: 'cultural_idiomas', estado: 'activo',
  },
  {
    id: 'cur-judo', codigo: 'DEP-011', nombre: 'Judo', descripcion: 'Arte marcial olímpico centrado en técnicas de proyección y control en el suelo.',
    objetivos: 'Desarrollar habilidades de judo, resistencia física y disciplina.',
    rubroId: 'rub-dep', categoriaId: 'cat-marc', subcategoriaId: 'sub-judo',
    publicoObjetivo: 'Niños, jóvenes y adultos',
    requiereCertificadoMedico: true, edadCertificadoMedico: 45,
    requiereDeclaracionJurada: true, manejaLevels: true,
    tipoNomenclaturaNivel: 'artes_marciales', estado: 'activo',
  },
  {
    id: 'cur-pintura', codigo: 'CUL-020', nombre: 'Pintura y Dibujo', descripcion: 'Taller de expresión artística con técnicas de acuarela, óleo y grafito.',
    objetivos: 'Desarrollar la creatividad y el dominio de técnicas pictóricas.',
    rubroId: 'rub-cul', categoriaId: 'cat-artes',
    publicoObjetivo: 'Todas las edades',
    requiereCertificadoMedico: false,
    requiereDeclaracionJurada: false, manejaLevels: false,
    tipoNomenclaturaNivel: 'general', estado: 'activo',
  },
];

// ──── Mock: Categorías por Edad ────

const MOCK_CATEGORIAS_EDAD: CategoriaEdad[] = [
  // Natación
  { id: 'ce-nat-ninos', cursoId: 'cur-natacion', nombre: 'Niños', edadMinima: 6, edadMaxima: 12, esUnica: false },
  { id: 'ce-nat-juv', cursoId: 'cur-natacion', nombre: 'Jóvenes', edadMinima: 13, edadMaxima: 17, esUnica: false },
  { id: 'ce-nat-adult', cursoId: 'cur-natacion', nombre: 'Adultos', edadMinima: 18, edadMaxima: 65, esUnica: false },
  // Karate
  { id: 'ce-kar-ninos', cursoId: 'cur-karate', nombre: 'Niños', edadMinima: 7, edadMaxima: 12, esUnica: false },
  { id: 'ce-kar-juv', cursoId: 'cur-karate', nombre: 'Jóvenes', edadMinima: 13, edadMaxima: 17, esUnica: false },
  { id: 'ce-kar-adult', cursoId: 'cur-karate', nombre: 'Adultos', edadMinima: 18, edadMaxima: 60, esUnica: false },
  // Fútbol
  { id: 'ce-fut-7a10', cursoId: 'cur-futbol', nombre: 'Niños 7-10', edadMinima: 7, edadMaxima: 10, esUnica: false },
  { id: 'ce-fut-11a14', cursoId: 'cur-futbol', nombre: 'Pre-juvenil 11-14', edadMinima: 11, edadMaxima: 14, esUnica: false },
  { id: 'ce-fut-15a18', cursoId: 'cur-futbol', nombre: 'Juvenil 15-18', edadMinima: 15, edadMaxima: 18, esUnica: false },
  // Guitarra
  { id: 'ce-gui-juv', cursoId: 'cur-guitarra', nombre: 'Jóvenes', edadMinima: 12, edadMaxima: 17, esUnica: false },
  { id: 'ce-gui-adult', cursoId: 'cur-guitarra', nombre: 'Adultos', edadMinima: 18, edadMaxima: 65, esUnica: false },
  // Ballet
  { id: 'ce-bal-inf', cursoId: 'cur-ballet', nombre: 'Infantil', edadMinima: 5, edadMaxima: 8, esUnica: false },
  { id: 'ce-bal-ninos', cursoId: 'cur-ballet', nombre: 'Niños', edadMinima: 9, edadMaxima: 12, esUnica: false },
  { id: 'ce-bal-juv', cursoId: 'cur-ballet', nombre: 'Jóvenes', edadMinima: 13, edadMaxima: 18, esUnica: false },
  // Inglés
  { id: 'ce-ing-juv', cursoId: 'cur-ingles', nombre: 'Jóvenes', edadMinima: 12, edadMaxima: 17, esUnica: false },
  { id: 'ce-ing-adult', cursoId: 'cur-ingles', nombre: 'Adultos', edadMinima: 18, edadMaxima: 65, esUnica: false },
  // Pintura (categoría única)
  { id: 'ce-pin-unica', cursoId: 'cur-pintura', nombre: 'Todas las edades', edadMinima: 8, edadMaxima: 70, esUnica: true },
  // Judo
  { id: 'ce-jud-ninos', cursoId: 'cur-judo', nombre: 'Niños', edadMinima: 7, edadMaxima: 12, esUnica: false },
  { id: 'ce-jud-adult', cursoId: 'cur-judo', nombre: 'Adultos', edadMinima: 18, edadMaxima: 55, esUnica: false },
];

// ──── Mock: Niveles de Habilidad ────

const MOCK_NIVELES: NivelHabilidad[] = [
  // Natación (general)
  { id: 'niv-nat-1', cursoId: 'cur-natacion', nombre: 'Principiante', orden: 1, requiereCertificado: false },
  { id: 'niv-nat-2', cursoId: 'cur-natacion', nombre: 'Intermedio', orden: 2, requiereCertificado: false },
  { id: 'niv-nat-3', cursoId: 'cur-natacion', nombre: 'Avanzado', orden: 3, requiereCertificado: false },
  // Karate (artes marciales - cinturones)
  { id: 'niv-kar-1', cursoId: 'cur-karate', nombre: 'Cinturón Blanco', orden: 1, requiereCertificado: false, descripcion: '10° Kyu' },
  { id: 'niv-kar-2', cursoId: 'cur-karate', nombre: 'Cinturón Amarillo', orden: 2, requiereCertificado: true, descripcion: '8° Kyu' },
  { id: 'niv-kar-3', cursoId: 'cur-karate', nombre: 'Cinturón Naranja', orden: 3, requiereCertificado: true, descripcion: '7° Kyu' },
  { id: 'niv-kar-4', cursoId: 'cur-karate', nombre: 'Cinturón Verde', orden: 4, requiereCertificado: true, descripcion: '6° Kyu' },
  { id: 'niv-kar-5', cursoId: 'cur-karate', nombre: 'Cinturón Marrón', orden: 5, requiereCertificado: true, descripcion: '3° Kyu' },
  { id: 'niv-kar-6', cursoId: 'cur-karate', nombre: 'Cinturón Negro', orden: 6, requiereCertificado: true, descripcion: '1° Dan' },
  // Fútbol (general)
  { id: 'niv-fut-1', cursoId: 'cur-futbol', nombre: 'Principiante', orden: 1, requiereCertificado: false },
  { id: 'niv-fut-2', cursoId: 'cur-futbol', nombre: 'Intermedio', orden: 2, requiereCertificado: false },
  { id: 'niv-fut-3', cursoId: 'cur-futbol', nombre: 'Avanzado', orden: 3, requiereCertificado: false },
  // Guitarra (cultural_idiomas)
  { id: 'niv-gui-1', cursoId: 'cur-guitarra', nombre: 'Básico 1', orden: 1, requiereCertificado: false },
  { id: 'niv-gui-2', cursoId: 'cur-guitarra', nombre: 'Básico 2', orden: 2, requiereCertificado: false },
  { id: 'niv-gui-3', cursoId: 'cur-guitarra', nombre: 'Intermedio 1', orden: 3, requiereCertificado: false },
  { id: 'niv-gui-4', cursoId: 'cur-guitarra', nombre: 'Intermedio 2', orden: 4, requiereCertificado: false },
  { id: 'niv-gui-5', cursoId: 'cur-guitarra', nombre: 'Avanzado', orden: 5, requiereCertificado: false },
  // Ballet (general)
  { id: 'niv-bal-1', cursoId: 'cur-ballet', nombre: 'Principiante', orden: 1, requiereCertificado: false },
  { id: 'niv-bal-2', cursoId: 'cur-ballet', nombre: 'Intermedio', orden: 2, requiereCertificado: false },
  { id: 'niv-bal-3', cursoId: 'cur-ballet', nombre: 'Avanzado', orden: 3, requiereCertificado: false },
  // Inglés (cultural_idiomas)
  { id: 'niv-ing-1', cursoId: 'cur-ingles', nombre: 'Básico 1', orden: 1, requiereCertificado: false },
  { id: 'niv-ing-2', cursoId: 'cur-ingles', nombre: 'Básico 2', orden: 2, requiereCertificado: false },
  { id: 'niv-ing-3', cursoId: 'cur-ingles', nombre: 'Intermedio 1', orden: 3, requiereCertificado: false },
  { id: 'niv-ing-4', cursoId: 'cur-ingles', nombre: 'Intermedio 2', orden: 4, requiereCertificado: false },
  { id: 'niv-ing-5', cursoId: 'cur-ingles', nombre: 'Avanzado', orden: 5, requiereCertificado: false },
  // Judo (artes marciales)
  { id: 'niv-jud-1', cursoId: 'cur-judo', nombre: 'Cinturón Blanco', orden: 1, requiereCertificado: false, descripcion: '6° Kyu' },
  { id: 'niv-jud-2', cursoId: 'cur-judo', nombre: 'Cinturón Amarillo', orden: 2, requiereCertificado: true, descripcion: '5° Kyu' },
  { id: 'niv-jud-3', cursoId: 'cur-judo', nombre: 'Cinturón Naranja', orden: 3, requiereCertificado: true, descripcion: '4° Kyu' },
  { id: 'niv-jud-4', cursoId: 'cur-judo', nombre: 'Cinturón Verde', orden: 4, requiereCertificado: true, descripcion: '3° Kyu' },
  { id: 'niv-jud-5', cursoId: 'cur-judo', nombre: 'Cinturón Marrón', orden: 5, requiereCertificado: true, descripcion: '1° Kyu' },
];

// ──── Mock: Docentes ────

const MOCK_DOCENTES: Docente[] = [
  { id: 'doc-1', nombre: 'Omar', apellido: 'Vásquez', especialidades: ['cur-natacion'] },
  { id: 'doc-2', nombre: 'Kenji', apellido: 'Tanaka', especialidades: ['cur-karate', 'cur-judo'] },
  { id: 'doc-3', nombre: 'Silvia', apellido: 'Montenegro', especialidades: ['cur-ballet'] },
  { id: 'doc-4', nombre: 'Pablo', apellido: 'Ríos', especialidades: ['cur-guitarra'] },
  { id: 'doc-5', nombre: 'Ricardo', apellido: 'Benítez', especialidades: ['cur-futbol'] },
  { id: 'doc-6', nombre: 'Catherine', apellido: 'Smith', especialidades: ['cur-ingles'] },
  { id: 'doc-7', nombre: 'Laura', apellido: 'Méndez', especialidades: ['cur-pintura'] },
];

// ──── Mock: Ambientes ────

const MOCK_AMBIENTES: Ambiente[] = [
  { id: 'amb-piscina', nombre: 'Piscina Olímpica', zona: 'Zona Acuática', tipo: 'Piscina', aforoFisico: 30, aforoPedagogico: 24, aforoComodin: 4, capacidad: 30 },
  { id: 'amb-dojo', nombre: 'Dojo Principal', zona: 'Zona Marcial', tipo: 'Dojo', aforoFisico: 25, aforoPedagogico: 18, aforoComodin: 2, capacidad: 25 },
  { id: 'amb-coliseo', nombre: 'Coliseo Cubierto', zona: 'Zona Polideportiva', tipo: 'Coliseo', aforoFisico: 120, aforoPedagogico: 80, aforoComodin: 10, capacidad: 120 },
  { id: 'amb-cancha1', nombre: 'Cancha de Fútbol 1', zona: 'Zona Campo', tipo: 'Cancha', aforoFisico: 30, aforoPedagogico: 22, aforoComodin: 3, capacidad: 30 },
  { id: 'amb-salon1', nombre: 'Salón de Música A', zona: 'Zona Cultural', tipo: 'Aula', aforoFisico: 15, aforoPedagogico: 12, aforoComodin: 2, capacidad: 15 },
  { id: 'amb-ballet', nombre: 'Salón de Danza', zona: 'Zona Cultural', tipo: 'Salón', aforoFisico: 20, aforoPedagogico: 14, aforoComodin: 2, capacidad: 20 },
  { id: 'amb-aula1', nombre: 'Aula 101', zona: 'Zona Académica', tipo: 'Aula', aforoFisico: 25, aforoPedagogico: 20, aforoComodin: 3, capacidad: 25 },
  { id: 'amb-taller', nombre: 'Taller de Artes', zona: 'Zona Creativa', tipo: 'Taller', aforoFisico: 15, aforoPedagogico: 10, aforoComodin: 1, capacidad: 15 },
];

// ──── Mock: Clases ────

const MOCK_CLASES: Clase[] = [
  {
    id: 'cls-nat-ninos-prin', cursoId: 'cur-natacion', categoriaEdadId: 'ce-nat-ninos',
    nivelId: 'niv-nat-1', ambienteId: 'amb-piscina', docenteId: 'doc-1',
    tipoHorario: 'cerrado',
    horarios: [
      { dia: 'lunes', horaInicio: '08:00', horaFin: '09:30' },
      { dia: 'miercoles', horaInicio: '08:00', horaFin: '09:30' },
      { dia: 'viernes', horaInicio: '08:00', horaFin: '09:30' },
    ],
    tipoDuracion: 'continua',
    vacantes: 20, matriculados: 16, tarifaMensual: 180, tarifaMatricula: 50,
    estado: 'abierta', periodo: '2026-I',
  },
  {
    id: 'cls-nat-adult-inter', cursoId: 'cur-natacion', categoriaEdadId: 'ce-nat-adult',
    nivelId: 'niv-nat-2', ambienteId: 'amb-piscina', docenteId: 'doc-1',
    tipoHorario: 'cerrado',
    horarios: [
      { dia: 'martes', horaInicio: '19:00', horaFin: '20:30' },
      { dia: 'jueves', horaInicio: '19:00', horaFin: '20:30' },
    ],
    tipoDuracion: 'continua',
    vacantes: 15, matriculados: 15, tarifaMensual: 200, tarifaMatricula: 50,
    estado: 'llena', periodo: '2026-I',
  },
  {
    id: 'cls-kar-ninos-blanc', cursoId: 'cur-karate', categoriaEdadId: 'ce-kar-ninos',
    nivelId: 'niv-kar-1', ambienteId: 'amb-dojo', docenteId: 'doc-2',
    tipoHorario: 'cerrado',
    horarios: [
      { dia: 'martes', horaInicio: '16:00', horaFin: '17:30' },
      { dia: 'jueves', horaInicio: '16:00', horaFin: '17:30' },
    ],
    tipoDuracion: 'continua',
    vacantes: 20, matriculados: 14, tarifaMensual: 160, tarifaMatricula: 40,
    estado: 'abierta', periodo: '2026-I',
  },
  {
    id: 'cls-kar-adult-verde', cursoId: 'cur-karate', categoriaEdadId: 'ce-kar-adult',
    nivelId: 'niv-kar-4', ambienteId: 'amb-dojo', docenteId: 'doc-2',
    tipoHorario: 'cerrado',
    horarios: [
      { dia: 'lunes', horaInicio: '20:00', horaFin: '21:30' },
      { dia: 'miercoles', horaInicio: '20:00', horaFin: '21:30' },
    ],
    tipoDuracion: 'continua',
    vacantes: 15, matriculados: 8, tarifaMensual: 200, tarifaMatricula: 50,
    estado: 'abierta', periodo: '2026-I',
  },
  {
    id: 'cls-fut-7a10-princ', cursoId: 'cur-futbol', categoriaEdadId: 'ce-fut-7a10',
    nivelId: 'niv-fut-1', ambienteId: 'amb-cancha1', docenteId: 'doc-5',
    tipoHorario: 'cerrado',
    horarios: [
      { dia: 'sabado', horaInicio: '09:00', horaFin: '10:30' },
    ],
    tipoDuracion: 'continua',
    vacantes: 25, matriculados: 22, tarifaMensual: 150, tarifaMatricula: 40,
    estado: 'abierta', periodo: '2026-I',
  },
  {
    id: 'cls-gui-adult-bas1', cursoId: 'cur-guitarra', categoriaEdadId: 'ce-gui-adult',
    nivelId: 'niv-gui-1', ambienteId: 'amb-salon1', docenteId: 'doc-4',
    tipoHorario: 'abierto',
    horarios: [
      { dia: 'miercoles', horaInicio: '18:00', horaFin: '19:30' },
      { dia: 'viernes', horaInicio: '18:00', horaFin: '19:30' },
    ],
    frecuenciaSemanal: 3,
    tipoDuracion: 'continua',
    vacantes: 12, matriculados: 10, tarifaMensual: 170, tarifaMatricula: 40,
    estado: 'abierta', periodo: '2026-I',
  },
  {
    id: 'cls-bal-inf-princ', cursoId: 'cur-ballet', categoriaEdadId: 'ce-bal-inf',
    nivelId: 'niv-bal-1', ambienteId: 'amb-ballet', docenteId: 'doc-3',
    tipoHorario: 'cerrado',
    horarios: [
      { dia: 'martes', horaInicio: '15:00', horaFin: '16:00' },
      { dia: 'jueves', horaInicio: '15:00', horaFin: '16:00' },
    ],
    tipoDuracion: 'finita',
    fechaInicio: '2026-03-01',
    fechaFin: '2026-07-31',
    vacantes: 15, matriculados: 12, tarifaMensual: 150, tarifaMatricula: 35,
    estado: 'abierta', periodo: '2026-I',
  },
  {
    id: 'cls-ing-adult-bas1', cursoId: 'cur-ingles', categoriaEdadId: 'ce-ing-adult',
    nivelId: 'niv-ing-1', ambienteId: 'amb-aula1', docenteId: 'doc-6',
    tipoHorario: 'cerrado',
    horarios: [
      { dia: 'lunes', horaInicio: '19:00', horaFin: '20:30' },
      { dia: 'miercoles', horaInicio: '19:00', horaFin: '20:30' },
    ],
    tipoDuracion: 'continua',
    vacantes: 20, matriculados: 18, tarifaMensual: 190, tarifaMatricula: 50,
    estado: 'abierta', periodo: '2026-I',
  },
];

// ──── Mock: Programas ────

const MOCK_PROGRAMAS: Programa[] = [
  {
    id: 'prog-verano', nombre: 'Programa Vacacional de Verano 2026', descripcion: 'Programa integral de actividades deportivas y culturales durante las vacaciones de verano. Incluye natación, fútbol, artes marciales y talleres artísticos.',
    tipo: 'vacacional', fechaInicio: '2026-01-05', fechaFin: '2026-02-28',
    cursoIds: ['cur-natacion', 'cur-futbol', 'cur-karate', 'cur-ballet'],
    claseIds: ['cls-nat-ninos-prin', 'cls-fut-7a10-princ', 'cls-kar-ninos-blanc', 'cls-bal-inf-princ'],
    estado: 'finalizado',
  },
  {
    id: 'prog-sem1', nombre: 'Programa Regular 1er Semestre 2026', descripcion: 'Oferta académica regular del primer semestre con cursos deportivos, musicales y culturales.',
    tipo: 'regular', fechaInicio: '2026-03-01', fechaFin: '2026-07-31',
    cursoIds: ['cur-natacion', 'cur-karate', 'cur-futbol', 'cur-guitarra', 'cur-ballet', 'cur-ingles'],
    claseIds: ['cls-nat-ninos-prin', 'cls-nat-adult-inter', 'cls-kar-ninos-blanc', 'cls-kar-adult-verde', 'cls-fut-7a10-princ', 'cls-gui-adult-bas1', 'cls-bal-inf-princ', 'cls-ing-adult-bas1'],
    estado: 'activo',
  },
];

const MOCK_BLOQUEOS_INSTITUCIONALES: BloqueoInstitucional[] = [
  {
    id: 'bloq-1',
    fecha: '2026-07-28',
    tipo: 'feriado',
    motivo: 'Fiestas Patrias',
  },
  {
    id: 'bloq-2',
    fecha: '2026-08-12',
    tipo: 'evento_interno',
    motivo: 'Mantenimiento general de infraestructura',
    zona: 'Zona Acuática',
  },
];

// ──── Servicio ────

@Injectable({ providedIn: 'root' })
export class AcademiaService {
  private readonly _rubros = signal<Rubro[]>(MOCK_RUBROS);
  private readonly _categorias = signal<CategoriaAcademica[]>(MOCK_CATEGORIAS);
  private readonly _subcategorias = signal<SubcategoriaAcademica[]>(MOCK_SUBCATEGORIAS);
  private readonly _cursos = signal<Curso[]>(MOCK_CURSOS);
  private readonly _categoriasEdad = signal<CategoriaEdad[]>(MOCK_CATEGORIAS_EDAD);
  private readonly _niveles = signal<NivelHabilidad[]>(MOCK_NIVELES);
  private readonly _docentes = signal<Docente[]>(MOCK_DOCENTES);
  private readonly _ambientes = signal<Ambiente[]>(MOCK_AMBIENTES);
  private readonly _clases = signal<Clase[]>(MOCK_CLASES);
  private readonly _programas = signal<Programa[]>(MOCK_PROGRAMAS);
  private readonly _bloqueosInstitucionales = signal<BloqueoInstitucional[]>(MOCK_BLOQUEOS_INSTITUCIONALES);

  // ── Lectores ──

  readonly rubros = this._rubros.asReadonly();
  readonly categorias = this._categorias.asReadonly();
  readonly subcategorias = this._subcategorias.asReadonly();
  readonly cursos = this._cursos.asReadonly();
  readonly categoriasEdad = this._categoriasEdad.asReadonly();
  readonly niveles = this._niveles.asReadonly();
  readonly docentes = this._docentes.asReadonly();
  readonly ambientes = this._ambientes.asReadonly();
  readonly clases = this._clases.asReadonly();
  readonly programas = this._programas.asReadonly();
  readonly bloqueosInstitucionales = this._bloqueosInstitucionales.asReadonly();

  // ── Computados ──

  readonly cursosActivos = computed(() => this._cursos().filter(c => c.estado === 'activo'));

  readonly arbolAcademico = computed(() => {
    const rubros = this._rubros();
    const categorias = this._categorias();
    const subcategorias = this._subcategorias();
    const cursos = this._cursos();

    return rubros
      .slice()
      .sort((a, b) => a.orden - b.orden)
      .map(rubro => ({
        ...rubro,
        categorias: categorias
          .filter(c => c.rubroId === rubro.id)
          .sort((a, b) => a.orden - b.orden)
          .map(cat => ({
            ...cat,
            subcategorias: subcategorias
              .filter(s => s.categoriaId === cat.id)
              .sort((a, b) => a.orden - b.orden)
              .map(sub => ({
                ...sub,
                cursos: cursos.filter(c => c.subcategoriaId === sub.id),
              })),
            cursosDirectos: cursos.filter(c => c.categoriaId === cat.id && !c.subcategoriaId),
          })),
      }));
  });

  // ── Getters por ID ──

  getRubroById(id: string): Rubro | undefined {
    return this._rubros().find(r => r.id === id);
  }

  getCategoriaById(id: string): CategoriaAcademica | undefined {
    return this._categorias().find(c => c.id === id);
  }

  getSubcategoriaById(id: string): SubcategoriaAcademica | undefined {
    return this._subcategorias().find(s => s.id === id);
  }

  getCursoById(id: string): Curso | undefined {
    return this._cursos().find(c => c.id === id);
  }

  getCategoriasEdadByCurso(cursoId: string): CategoriaEdad[] {
    return this._categoriasEdad().filter(c => c.cursoId === cursoId);
  }

  getNivelesByCurso(cursoId: string): NivelHabilidad[] {
    return this._niveles().filter(n => n.cursoId === cursoId).sort((a, b) => a.orden - b.orden);
  }

  getClasesByCurso(cursoId: string): Clase[] {
    return this._clases().filter(c => c.cursoId === cursoId);
  }

  getClaseById(id: string): Clase | undefined {
    return this._clases().find(c => c.id === id);
  }

  getDocenteById(id: string): Docente | undefined {
    return this._docentes().find(d => d.id === id);
  }

  getAmbienteById(id: string): Ambiente | undefined {
    return this._ambientes().find(a => a.id === id);
  }

  getAforoRegularDisponibleAmbiente(ambienteId: string): number {
    const ambiente = this.getAmbienteById(ambienteId);
    if (!ambiente) return 0;
    const limiteBase = Math.min(ambiente.aforoFisico, ambiente.aforoPedagogico);
    return Math.max(limiteBase - ambiente.aforoComodin, 0);
  }

  getCategoriaEdadById(id: string): CategoriaEdad | undefined {
    return this._categoriasEdad().find(c => c.id === id);
  }

  getNivelById(id: string): NivelHabilidad | undefined {
    return this._niveles().find(n => n.id === id);
  }

  getProgramaById(id: string): Programa | undefined {
    return this._programas().find(p => p.id === id);
  }

  getClasesByPrograma(programaId: string): Clase[] {
    const programa = this.getProgramaById(programaId);
    if (!programa) return [];
    const claseIds = new Set([
      ...programa.claseIds,
      ...this._clases()
        .filter(clase => programa.cursoIds.includes(clase.cursoId))
        .map(clase => clase.id),
    ]);

    return Array.from(claseIds)
      .map(id => this.getClaseById(id))
      .filter((c): c is Clase => !!c);
  }

  getCursosByPrograma(programaId: string): Curso[] {
    const programa = this.getProgramaById(programaId);
    if (!programa) return [];

    return programa.cursoIds
      .map(id => this.getCursoById(id))
      .filter((curso): curso is Curso => !!curso);
  }

  getProgramasByCurso(cursoId: string): Programa[] {
    return this._programas().filter(programa => programa.cursoIds.includes(cursoId));
  }

  getCategoriasByRubro(rubroId: string): CategoriaAcademica[] {
    return this._categorias().filter(c => c.rubroId === rubroId).sort((a, b) => a.orden - b.orden);
  }

  getSubcategoriasByCategoria(categoriaId: string): SubcategoriaAcademica[] {
    return this._subcategorias().filter(s => s.categoriaId === categoriaId).sort((a, b) => a.orden - b.orden);
  }

  // ── CRUD Cursos ──

  createCurso(curso: Omit<Curso, 'id'>): void {
    this._cursos.update(items => [...items, { ...curso, id: crypto.randomUUID() }]);
  }

  updateCurso(id: string, changes: Partial<Curso>): void {
    this._cursos.update(items => items.map(c => c.id === id ? { ...c, ...changes } : c));
  }

  deleteCurso(id: string): void {
    this._cursos.update(items => items.filter(c => c.id !== id));
  }

  // ── CRUD Categorías de Edad ──

  addCategoriaEdad(item: Omit<CategoriaEdad, 'id'>): void {
    this._categoriasEdad.update(items => [...items, { ...item, id: crypto.randomUUID() }]);
  }

  removeCategoriaEdad(id: string): void {
    this._categoriasEdad.update(items => items.filter(c => c.id !== id));
  }

  // ── CRUD Niveles ──

  addNivel(item: Omit<NivelHabilidad, 'id'>): void {
    this._niveles.update(items => [...items, { ...item, id: crypto.randomUUID() }]);
  }

  removeNivel(id: string): void {
    this._niveles.update(items => items.filter(n => n.id !== id));
  }

  // ── CRUD Clases ──

  createClase(clase: Omit<Clase, 'id'>): void {
    this._clases.update(items => [...items, { ...clase, id: crypto.randomUUID() }]);
  }

  updateClase(id: string, changes: Partial<Clase>): void {
    this._clases.update(items => items.map(c => c.id === id ? { ...c, ...changes } : c));
  }

  deleteClase(id: string): void {
    this._clases.update(items => items.filter(c => c.id !== id));
  }

  validateProgramacionClase(input: {
    ambienteId: string;
    horarios: HorarioClase[];
    periodo: string;
    tipoDuracion: 'finita' | 'continua';
    fechaInicio?: string;
    fechaFin?: string;
    claseIdExcluir?: string;
  }): ValidacionProgramacionClaseResultado {
    const mensajes: string[] = [];
    const ambiente = this.getAmbienteById(input.ambienteId);

    if (!ambiente) {
      return {
        permitido: false,
        mensajes: ['Seleccione un ambiente válido para programar la clase.'],
        sesionesReplica: 0,
      };
    }

    if (input.horarios.length === 0) {
      mensajes.push('Debe registrar al menos un bloque horario.');
    }

    if (input.tipoDuracion === 'finita') {
      if (!input.fechaInicio || !input.fechaFin) {
        mensajes.push('Para duración finita debe indicar fecha de inicio y fin.');
      } else if (input.fechaInicio > input.fechaFin) {
        mensajes.push('La fecha de inicio no puede ser mayor a la fecha de fin.');
      }
    }

    const clasesMismaZona = this._clases().filter(clase => {
      if (input.claseIdExcluir && clase.id === input.claseIdExcluir) return false;
      if (clase.periodo !== input.periodo) return false;
      const ambienteClase = this.getAmbienteById(clase.ambienteId);
      if (!ambienteClase) return false;
      return ambienteClase.id === ambiente.id || ambienteClase.zona === ambiente.zona;
    });

    for (const claseExistente of clasesMismaZona) {
      const ambienteExistente = this.getAmbienteById(claseExistente.ambienteId);
      if (!ambienteExistente) continue;

      const conflictoHorario = input.horarios.some(nuevo =>
        claseExistente.horarios.some(existente =>
          nuevo.dia === existente.dia &&
          this.horariosSeCruzan(nuevo.horaInicio, nuevo.horaFin, existente.horaInicio, existente.horaFin)
        )
      );

      if (!conflictoHorario) continue;

      const conflictoFechas = this.rangosSeCruzan(
        input.tipoDuracion,
        input.fechaInicio,
        input.fechaFin,
        claseExistente.tipoDuracion,
        claseExistente.fechaInicio,
        claseExistente.fechaFin
      );

      if (!conflictoFechas) continue;

      mensajes.push(
        `Cruce detectado con la clase ${claseExistente.id} en ${ambienteExistente.nombre} (${ambienteExistente.zona}).`
      );
    }

    const sesionesReplica = this.generarReplicaSemanal(input.horarios, input.fechaInicio, input.fechaFin).length;

    if (input.tipoDuracion === 'finita' && input.fechaInicio && input.fechaFin) {
      const { fechaInicio, fechaFin } = input;
      const sesiones = this.generarReplicaSemanal(input.horarios, fechaInicio, fechaFin);
      const bloqueos = this._bloqueosInstitucionales().filter(b => {
        if (b.fecha < fechaInicio || b.fecha > fechaFin) return false;
        if (!b.zona) return true;
        return b.zona === ambiente.zona;
      });

      if (bloqueos.length > 0) {
        for (const bloqueo of bloqueos) {
          const afecta = sesiones.some(sesion => sesion.fecha === bloqueo.fecha);
          if (afecta) {
            mensajes.push(`Bloqueo institucional ${bloqueo.fecha}: ${bloqueo.motivo}.`);
          }
        }
      }
    }

    if (mensajes.length === 0) {
      mensajes.push('Programación válida: sin cruces de zona y sin bloqueos institucionales.');
    }

    return {
      permitido: mensajes.length === 1 && mensajes[0].startsWith('Programación válida'),
      mensajes,
      sesionesReplica,
    };
  }

  // ── CRUD Ambientes ──

  createAmbiente(ambiente: Omit<Ambiente, 'id' | 'capacidad'>): void {
    this._ambientes.update(items => [
      ...items,
      {
        ...ambiente,
        capacidad: ambiente.aforoFisico,
        id: crypto.randomUUID(),
      },
    ]);
  }

  updateAmbiente(id: string, changes: Partial<Ambiente>): void {
    this._ambientes.update(items =>
      items.map(ambiente => {
        if (ambiente.id !== id) return ambiente;
        const next = { ...ambiente, ...changes };
        return { ...next, capacidad: next.aforoFisico };
      })
    );
  }

  deleteAmbiente(id: string): void {
    this._ambientes.update(items => items.filter(ambiente => ambiente.id !== id));
  }

  createBloqueoInstitucional(bloqueo: Omit<BloqueoInstitucional, 'id'>): void {
    this._bloqueosInstitucionales.update(items => [
      ...items,
      {
        ...bloqueo,
        id: crypto.randomUUID(),
      },
    ]);
  }

  deleteBloqueoInstitucional(id: string): void {
    this._bloqueosInstitucionales.update(items => items.filter(bloqueo => bloqueo.id !== id));
  }

  generarReplicaSemanal(horarios: HorarioClase[], fechaInicio?: string, fechaFin?: string): SesionProgramadaClase[] {
    if (!fechaInicio || !fechaFin || horarios.length === 0 || fechaInicio > fechaFin) {
      return [];
    }

    const sesiones: SesionProgramadaClase[] = [];
    let fecha = new Date(`${fechaInicio}T00:00:00`);
    const fin = new Date(`${fechaFin}T00:00:00`);

    while (fecha <= fin) {
      const diaActual = this.dateToDiaSemana(fecha);
      for (const horario of horarios) {
        if (horario.dia === diaActual) {
          sesiones.push({
            fecha: fecha.toISOString().split('T')[0] ?? '',
            dia: horario.dia,
            horaInicio: horario.horaInicio,
            horaFin: horario.horaFin,
          });
        }
      }
      fecha = new Date(fecha.getTime() + 24 * 60 * 60 * 1000);
    }

    return sesiones;
  }

  // ── CRUD Programas ──

  createPrograma(programa: Omit<Programa, 'id'>): void {
    this._programas.update(items => [...items, { ...programa, id: crypto.randomUUID() }]);
  }

  updatePrograma(id: string, changes: Partial<Programa>): void {
    this._programas.update(items => items.map(p => p.id === id ? { ...p, ...changes } : p));
  }

  deletePrograma(id: string): void {
    this._programas.update(items => items.filter(p => p.id !== id));
  }

  // ── CRUD Rubros / Categorías / Subcategorías ──

  createRubro(rubro: Omit<Rubro, 'id'>): void {
    this._rubros.update(items => [...items, { ...rubro, id: crypto.randomUUID() }]);
  }

  createCategoria(cat: Omit<CategoriaAcademica, 'id'>): void {
    this._categorias.update(items => [...items, { ...cat, id: crypto.randomUUID() }]);
  }

  createSubcategoria(sub: Omit<SubcategoriaAcademica, 'id'>): void {
    this._subcategorias.update(items => [...items, { ...sub, id: crypto.randomUUID() }]);
  }

  private horariosSeCruzan(inicioA: string, finA: string, inicioB: string, finB: string): boolean {
    const iniA = this.horaToMinutos(inicioA);
    const endA = this.horaToMinutos(finA);
    const iniB = this.horaToMinutos(inicioB);
    const endB = this.horaToMinutos(finB);
    return iniA < endB && iniB < endA;
  }

  private horaToMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  private rangosSeCruzan(
    tipoA: 'finita' | 'continua',
    inicioA?: string,
    finA?: string,
    tipoB?: 'finita' | 'continua',
    inicioB?: string,
    finB?: string
  ): boolean {
    if (tipoA !== 'finita' || tipoB !== 'finita') {
      return true;
    }

    if (!inicioA || !finA || !inicioB || !finB) {
      return true;
    }

    return !(finA < inicioB || finB < inicioA);
  }

  private dateToDiaSemana(fecha: Date): HorarioClase['dia'] {
    const map: HorarioClase['dia'][] = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    return map[fecha.getDay()] ?? 'lunes';
  }
}
