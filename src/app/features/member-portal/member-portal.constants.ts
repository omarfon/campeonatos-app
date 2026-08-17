/** Identidad y rutas del Portal Socio. */
export const MEMBER_PORTAL_NAME = 'Portal Socio';
export const MEMBER_PORTAL_SHORT = 'Socio';
export const MEMBER_PORTAL_TAGLINE = 'Tu espacio familiar e institucional';
export const MEMBER_PORTAL_ROUTE_PREFIX = '/socio';
export const MEMBER_PORTAL_LOGIN_ROUTE = '/socio/login';
export const MAIN_PORTAL_HOME_ROUTE = '/gestion/competencias';
export const MAIN_PORTAL_LABEL = 'Portal principal';

export function memberPortalRoute(...segments: string[]): string[] {
  return [MEMBER_PORTAL_ROUTE_PREFIX, ...segments];
}
