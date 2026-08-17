import { AppUserSession } from '../models/app-session.model';

export const MOCK_APP_LOGIN = {
  email: 'admin@aelu.org',
  password: 'demo123',
};

export const MOCK_APP_SESSION: AppUserSession = {
  userId: 'usr-admin-1',
  fullName: 'Carlos Mendoza Ruiz',
  email: 'admin@aelu.org',
  role: 'Administrador general',
  documentType: 'DNI',
  documentNumber: '12345678',
  area: 'Gestión integral deportiva',
};
