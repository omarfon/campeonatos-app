import { MemberBenefit } from '../models/member-portal.model';

export const MOCK_MEMBER_BENEFITS: MemberBenefit[] = [
  {
    id: 'ben-1',
    name: 'Convenio Empresa ABC',
    description: 'Descuento corporativo para empleados de Empresa ABC en disciplinas acuáticas y marciales.',
    discountLabel: '20% de beneficio',
    validUntil: '2026-12-31',
    applicableTo: ['Natación', 'Karate'],
    sponsor: 'Empresa ABC S.A.C.',
    status: 'active',
    coveragePercent: 20,
  },
  {
    id: 'ben-2',
    name: 'Membresía familiar',
    description: 'Beneficio automático al inscribir una segunda actividad para integrantes del mismo grupo familiar.',
    discountLabel: '10% en actividades adicionales',
    validUntil: '2026-12-31',
    applicableTo: ['Todas las disciplinas'],
    status: 'active',
    coveragePercent: 10,
  },
  {
    id: 'ben-3',
    name: 'Convenio Universidad XYZ',
    description: 'Alianza institucional para estudiantes universitarios. Requiere validación anual.',
    discountLabel: '15% en gimnasio y danza',
    validUntil: '2025-12-31',
    applicableTo: ['Gimnasio', 'Danza'],
    sponsor: 'Universidad XYZ',
    status: 'expired',
    coveragePercent: 15,
  },
];
