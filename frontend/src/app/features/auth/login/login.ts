import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { Auth } from '../../../core/services/auth';
import { Button } from '../../../shared/components/ui/button/button';
import { Input } from '../../../shared/components/ui/input/input';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Button, Input],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(Auth);

  // UI State: 'login' | 'setup2fa' | 'verify2fa'
  loginState = signal<'login' | 'setup2fa' | 'verify2fa'>('login');
  isLoading = signal(false);
  errorMessage = signal('');
  qrCodeUrl = signal('');

  // Forms
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  twoFactorForm: FormGroup = this.fb.group({
    token: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  onSubmitLogin() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const credentials = this.loginForm.value;

    this.http
      .post<any>('http://localhost:5000/api/users/login', credentials, { withCredentials: true })
      .pipe(
        catchError((err) => {
          this.errorMessage.set(err.error?.message || 'Invalid email or password');
          return of(null);
        }),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe((res) => {
        if (!res) return;

        if (res.requires2FA) {
          this.loginState.set('verify2fa');
        } else if (res.setup2FA) {
          this.qrCodeUrl.set(res.qrCodeUrl);
          this.loginState.set('setup2fa');
        } else if (res.token) {
          // Successfully logged in
          this.authService.setSession(res.token, res.role);
          if (res.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/user']); // Redirect to user dashboard
          }
        }
      });
  }

  onSubmit2FA() {
    if (this.twoFactorForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const payload = {
      ...this.loginForm.value,
      twoFactorToken: this.twoFactorForm.value.token,
    };

    this.http
      .post<any>('http://localhost:5000/api/users/login', payload, { withCredentials: true })
      .pipe(
        catchError((err) => {
          this.errorMessage.set(err.error?.message || 'Invalid 2FA token');
          return of(null);
        }),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe((res) => {
        if (!res) return;

        if (res.token) {
          this.authService.setSession(res.token, res.role);
          if (res.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/user']); // Redirect to user dashboard
          }
        }
      });
  }

  backToLogin() {
    this.loginState.set('login');
    this.twoFactorForm.reset();
    this.errorMessage.set('');
  }
}
