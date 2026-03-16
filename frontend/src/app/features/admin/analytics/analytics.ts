import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface SalesData {
  _id: string; // Date string
  totalSales: number;
}

interface TopProduct {
  _id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
}

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.html',
})
export class AdminAnalytics implements OnInit {
  private http = inject(HttpClient);

  salesData = signal<SalesData[]>([]);
  topProducts = signal<TopProduct[]>([]);

  isLoadingSales = signal(true);
  isLoadingProducts = signal(true);

  error = signal<string | null>(null);

  maxSaleValue = signal(0); // For dynamic CSS charting

  ngOnInit() {
    this.fetchAnalytics();
  }

  fetchAnalytics() {
    this.isLoadingSales.set(true);
    this.isLoadingProducts.set(true);
    this.error.set(null);

    // Fetch Sales Time-Series
    this.http
      .get<
        SalesData[]
      >('http://localhost:5000/api/analytics/sales-chart', { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.salesData.set(data);
          const max = Math.max(...data.map((d) => d.totalSales), 1);
          this.maxSaleValue.set(max);
          this.isLoadingSales.set(false);
        },
        error: (err) => {
          console.error(err);
          this.error.set('Failed to load generic sales projections.');
          this.isLoadingSales.set(false);
        },
      });

    // Fetch Top Products
    this.http
      .get<
        TopProduct[]
      >('http://localhost:5000/api/analytics/top-products', { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.topProducts.set(data);
          this.isLoadingProducts.set(false);
        },
        error: (err) => {
          console.error(err);
          this.error.set('Failed to load generic product matrix.');
          this.isLoadingProducts.set(false);
        },
      });
  }
}
