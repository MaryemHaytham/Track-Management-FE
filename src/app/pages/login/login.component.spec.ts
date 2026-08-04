import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let auth: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to tracks after successful login', () => {
    auth.login.and.returnValue(
      of({
        token: 'jwt-token',
        username: 'admin',
        expiresAtUtc: new Date(Date.now() + 60_000).toISOString()
      })
    );
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    component.submit();

    expect(auth.login).toHaveBeenCalledWith({ username: 'admin', password: 'Admin@123' });
    expect(component.loading).toBeFalse();
    expect(component.error).toBe('');
    expect(navigateSpy).toHaveBeenCalledWith(['/tracks']);
  });

  it('should surface an API error message on failed login', () => {
    auth.login.and.returnValue(throwError(() => ({ error: { error: 'Invalid credentials' } })));

    component.submit();

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('Invalid credentials');
  });
});
