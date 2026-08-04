import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  username = 'admin';
  password = 'Admin@123';
  loading = false;
  error = '';

  submit(): void {
    this.loading = true;
    this.error = '';

    this.auth.login({ username: this.username.trim(), password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        void this.router.navigate(['/tracks']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.error ?? 'Login failed. Check your credentials and that the API is running.';
      }
    });
  }
}
