import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse, UserDTO } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API_URL = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly USER_KEY = 'current_user';

  // ── Signals ───────────────────────────────────────────────
  private _currentUser = signal<UserDTO | null>(this.getUserFromStorage());
  currentUser = this._currentUser.asReadonly();

  isLoggedIn = computed(() => this._currentUser() !== null);
  isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');
  isClient = computed(() => this._currentUser()?.typeUser === 'CLIENT');
  isEmetteur = computed(() => this._currentUser()?.typeUser === 'EMETTEUR');

  constructor(private http: HttpClient, private router: Router) {
    this.checkTokenExpiry();
  }

  // ── LOGIN ───────────────────────────────────────────────
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, request).pipe(
      tap(response => this.saveSession(response))
    );
  }

  // ── REGISTER ────────────────────────────────────────────
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, request).pipe(
      tap(response => this.saveSession(response))
    );
  }

  // ── LOGOUT ──────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  // ── TOKEN ───────────────────────────────────────────────
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // ── PRIVÉS ──────────────────────────────────────────────
  private saveSession(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);

    const user: UserDTO = {
      id: response.id,
      nom: response.nom,
      prenom: response.prenom,
      email: response.email,
      telephone: response.telephone,
      role: response.role,
      typeUser: response.typeUser,
      enabled: true
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._currentUser.set(user);
  }

  private getUserFromStorage(): UserDTO | null {
    const stored = localStorage.getItem(this.USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  private checkTokenExpiry(): void {
    const token = this.getToken();
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        console.warn('🔒 Token expiré détecté — déconnexion automatique');
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this._currentUser.set(null);
      }
    } catch {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      this._currentUser.set(null);
    }
  }
}