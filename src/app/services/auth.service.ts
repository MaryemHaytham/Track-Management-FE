import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/track.models';

const TOKEN_KEY = 'takwene_token';
const USER_KEY = 'takwene_user';
const EXPIRES_KEY = 'takwene_expires';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly tokenSignal = signal<string | null>(this.readToken());
  private readonly usernameSignal = signal<string | null>(localStorage.getItem(USER_KEY));

  readonly token = this.tokenSignal.asReadonly();
  readonly username = this.usernameSignal.asReadonly();
  readonly isAuthenticated = computed(() => {
    const token = this.tokenSignal();
    if (!token) {
      return false;
    }
    const expires = localStorage.getItem(EXPIRES_KEY);
    if (!expires) {
      return true;
    }
    return new Date(expires).getTime() > Date.now();
  });

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, request).pipe(
      tap((response) => {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, response.username);
        localStorage.setItem(EXPIRES_KEY, response.expiresAtUtc);
        this.tokenSignal.set(response.token);
        this.usernameSignal.set(response.username);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    this.tokenSignal.set(null);
    this.usernameSignal.set(null);
    void this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (!this.isAuthenticated()) {
      return null;
    }
    return this.tokenSignal();
  }

  private readToken(): string | null {
    const expires = localStorage.getItem(EXPIRES_KEY);
    if (expires && new Date(expires).getTime() <= Date.now()) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(EXPIRES_KEY);
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }
}
