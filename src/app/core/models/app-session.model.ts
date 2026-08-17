export interface AppUserSession {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  documentType: string;
  documentNumber: string;
  area: string;
}

export interface AppLoginRequest {
  email: string;
  password: string;
}

export interface AppLoginResponse {
  session: AppUserSession;
  token: string;
}
