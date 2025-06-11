export interface Usuario {
  id: string;
  name: string;
  email: string;
  password: string;
  isoCode: string;
  communityId: number;
  provinceId: number;
  role: string;
  createdAt: string;
}

export interface JwtPayload {
  role: string;
  exp: number;
}

export interface LoginResponse {
  message: string;
  user: Usuario;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: Usuario;
  token: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  isoCode: string;
  communityId: number;
  provinceId: number;
  password: string;
}
