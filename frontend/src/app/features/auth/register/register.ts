import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CanComponentDeactivate } from '../../../core/guards/prevent-unsaved-changes.guard';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal('');

  registerForm: FormGroup = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator },
  );

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  onSubmitRegister() {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const credentials = this.registerForm.value;

    this.http
      .post<any>('http://localhost:5000/api/users/register', credentials, { withCredentials: true })
      .pipe(
        catchError((err) => {
          this.errorMessage.set(err.error?.message || 'Failed to register account');
          return of(null);
        }),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe((res) => {
        if (!res) return;

        // Redirect to login on successful registration
        this.registerForm.reset();
        this.router.navigate(['/login']);
      });
  }

  canDeactivate(): boolean {
    if (this.registerForm.dirty && !this.registerForm.pristine) {
      return confirm('You have unsaved changes! Are you sure you want to navigate away?');
    }
    return true;
  }
}
