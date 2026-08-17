/** Identidad y rutas del Portal Alumno (distinto al Portal Socio y Portal Eventos). */
export const STUDENT_PORTAL_NAME = 'Portal Alumno';
export const STUDENT_PORTAL_SHORT = 'Alumno';
export const STUDENT_PORTAL_TAGLINE = 'Tu espacio de formación y autoservicio académico';
export const STUDENT_PORTAL_ROUTE_PREFIX = '/portal-alumno';
export const STUDENT_PORTAL_LOGIN_ROUTE = '/portal-alumno/login';
export const MAIN_PORTAL_HOME_ROUTE = '/gestion/competencias';
export const MAIN_PORTAL_LABEL = 'Portal principal';

export function studentPortalRoute(...segments: string[]): string[] {
  return [STUDENT_PORTAL_ROUTE_PREFIX, ...segments];
}
