import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let httpMock: HttpTestingController;
  let router: Router;

  function setup(): AuthService {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    return TestBed.inject(AuthService);
  }

  afterEach(() => {
    httpMock?.verify();
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('should start unauthenticated when storage is empty', () => {
    localStorage.clear();
    const service = setup();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.getToken()).toBeNull();
    expect(service.username()).toBeNull();
  });

  it('should store credentials on successful login', () => {
    localStorage.clear();
    const service = setup();
    const expires = new Date(Date.now() + 60_000).toISOString();

    service.login({ username: 'admin', password: 'Admin@123' }).subscribe((response) => {
      expect(response.token).toBe('jwt-token');
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.getToken()).toBe('jwt-token');
      expect(service.username()).toBe('admin');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'admin', password: 'Admin@123' });
    req.flush({
      token: 'jwt-token',
      username: 'admin',
      expiresAtUtc: expires
    });
  });

  it('should clear session and navigate to login on logout', () => {
    localStorage.clear();
    const service = setup();
    const expires = new Date(Date.now() + 60_000).toISOString();
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    service.login({ username: 'admin', password: 'Admin@123' }).subscribe();
    httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`).flush({
      token: 'jwt-token',
      username: 'admin',
      expiresAtUtc: expires
    });

    service.logout();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.getToken()).toBeNull();
    expect(localStorage.getItem('takwene_token')).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should treat expired tokens as unauthenticated', () => {
    localStorage.setItem('takwene_token', 'expired-token');
    localStorage.setItem('takwene_user', 'admin');
    localStorage.setItem('takwene_expires', new Date(Date.now() - 60_000).toISOString());

    const service = setup();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.getToken()).toBeNull();
  });
});
