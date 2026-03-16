import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
})
export class AdminDashboard implements OnInit {
  private http = inject(HttpClient);

  // Dashboard Metrics State
  isLoading = signal(true);
  error = signal<string | null>(null);

  metrics = signal({
    totalUsers: 0,
    activeUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
  });

  ngOnInit() {
    this.fetchOverview();
  }

  fetchOverview() {
    this.isLoading.set(true);
    this.error.set(null);
    this.http
      .get<any>('http://localhost:5000/api/analytics/overview', { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.metrics.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load dashboard metrics', err);
          this.error.set('Failed to load metrics. Please check your connection.');
          this.isLoading.set(false);
        },
      });
  }
}
