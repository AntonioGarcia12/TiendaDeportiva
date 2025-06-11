import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { JwtPayload, LoginCredentials, LoginResponse, RegisterCredentials, RegisterResponse, Usuario } from '@app/models/user';
import { environment } from '@env';
import { jwtDecode } from 'jwt-decode';
import { catchError, delay, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly urlLogin = `${environment.apiBaseUrl}/auth/signin`;
  private readonly urlRegister = `${environment.apiBaseUrl}/auth/signup`;
  private readonly TOKEN_KEY = 'token';
  private readonly ROLE_KEY = 'rol';
  private readonly USER_KEY = 'user';

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.urlLogin, credentials).pipe(
      catchError((err) => {
        console.error('Error en login:', err);
        return throwError(() => err);
      }),
      delay(1000)
    );
  }

  register(credentials: RegisterCredentials): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(this.urlRegister, credentials).pipe(
      catchError((err) => {
        console.error('Error en register:', err);
        return throwError(() => err);
      }),
      delay(1000)
    );
  }

  setSession(token: string, rolFromRes?: string, usuario?: Usuario) {
    localStorage.setItem(this.TOKEN_KEY, token);

    const rol = rolFromRes ? rolFromRes : jwtDecode<JwtPayload>(token).role;
    localStorage.setItem(this.ROLE_KEY, rol);

    if (usuario) localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
  }

  isAuthenticated(): boolean {
    const t = this.token;
    if (!t) return false;

    try {
      const { exp } = jwtDecode<JwtPayload>(t);
      return exp * 1_000 > Date.now();
    } catch {
      return false;
    }
  }

  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  isUser(): boolean {
    return this.role === 'USER';
  }

  clear() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
  }

  get currentUser(): Usuario | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Usuario;
    } catch {
      return null;
    }
  }

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  get role(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }
}
