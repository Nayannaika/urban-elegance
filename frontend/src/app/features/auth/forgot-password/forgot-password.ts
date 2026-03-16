import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private authService = inject(Auth);

  email = '';
  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  resetUrl = signal<string | null>(null);

  onSubmit() {
    if (!this.email) {
      this.errorMessage.set('Please enter your email address.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.resetUrl.set(null);

    this.authService.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.successMessage.set('A password reset link has been generated successfully.');
        if (res.resetUrl) {
          this.resetUrl.set(res.resetUrl);
        }
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to send reset link. Please try again.');
        this.isSubmitting.set(false);
      },
    });
  }
}
