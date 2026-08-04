import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './services/auth.service';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let auth: {
    isAuthenticated: ReturnType<typeof signal<boolean>>;
    username: ReturnType<typeof signal<string | null>>;
    logout: jasmine.Spy;
  };

  beforeEach(async () => {
    auth = {
      isAuthenticated: signal(true),
      username: signal('admin'),
      logout: jasmine.createSpy('logout')
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([{ path: 'tracks', children: [] }]), { provide: AuthService, useValue: auth }]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should expose auth state and logout', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;

    expect(component.isAuthenticated()).toBeTrue();
    expect(component.username()).toBe('admin');

    component.logout();
    expect(auth.logout).toHaveBeenCalled();
  });
});
