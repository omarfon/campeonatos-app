import { MEMBER_PORTAL_ROUTE_PREFIX } from './member-portal.constants';
import { MemberPortalMenuItem } from './models/member-portal.model';

export const MEMBER_PORTAL_MENU: MemberPortalMenuItem[] = [
  { label: 'Inicio', icon: '🏠', route: `${MEMBER_PORTAL_ROUTE_PREFIX}/inicio` },
  { label: 'Mi Familia', icon: '👨‍👩‍👧', route: `${MEMBER_PORTAL_ROUTE_PREFIX}/familia`, permission: 'MEMBER_FAMILY_VIEW' },
  { label: 'Actividades', icon: '🏊', route: `${MEMBER_PORTAL_ROUTE_PREFIX}/actividades`, permission: 'MEMBER_ACTIVITY_VIEW' },
  { label: 'Mis Actividades', icon: '📋', route: `${MEMBER_PORTAL_ROUTE_PREFIX}/mis-actividades`, permission: 'MEMBER_ACTIVITY_VIEW' },
  { label: 'Calendario', icon: '📅', route: `${MEMBER_PORTAL_ROUTE_PREFIX}/calendario`, permission: 'MEMBER_FAMILY_VIEW' },
  { label: 'Estado de cuenta', icon: '💳', route: `${MEMBER_PORTAL_ROUTE_PREFIX}/pagos`, permission: 'MEMBER_PAYMENT_VIEW' },
  { label: 'Documentos', icon: '📁', route: `${MEMBER_PORTAL_ROUTE_PREFIX}/documentos`, permission: 'MEMBER_DOCUMENT_VIEW' },
];

export const MEMBER_MOBILE_NAV: MemberPortalMenuItem[] = [
  { label: 'Inicio', icon: '🏠', route: `${MEMBER_PORTAL_ROUTE_PREFIX}/inicio` },
  { label: 'Familia', icon: '👨‍👩‍👧', route: `${MEMBER_PORTAL_ROUTE_PREFIX}/familia` },
  { label: 'Actividades', icon: '🏊', route: `${MEMBER_PORTAL_ROUTE_PREFIX}/actividades` },
  { label: 'Pagos', icon: '💳', route: `${MEMBER_PORTAL_ROUTE_PREFIX}/pagos` },
  { label: 'Yo', icon: '👤', route: `${MEMBER_PORTAL_ROUTE_PREFIX}/perfil` },
];
