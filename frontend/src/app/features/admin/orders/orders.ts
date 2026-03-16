import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface OrderData {
  _id: string;
  user: { name: string; email: string };
  totalPrice: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.html',
})
export class AdminOrders implements OnInit {
  private http = inject(HttpClient);

  orders = signal<OrderData[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.isLoading.set(true);
    this.http
      .get<OrderData[]>('http://localhost:5000/api/orders', { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          this.orders.set(res.data || res);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to fetch orders', err);
          this.error.set('Unable to load the order queue.');
          this.isLoading.set(false);
        },
      });
  }

  updateStatus(orderId: string, newStatus: string) {
    this.http
      .put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { orderStatus: newStatus },
        { withCredentials: true },
      )
      .subscribe({
        next: () => {
          this.orders.update((orders) =>
            orders.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)),
          );
        },
        error: (err) => alert(err.error?.message || 'Failed to update order status.'),
      });
  }

  refundOrder(orderId: string) {
    if (confirm('Initiate a refund for this order? This action is irreversible.')) {
      this.http
        .post(`http://localhost:5000/api/orders/${orderId}/refund`, {}, { withCredentials: true })
        .subscribe({
          next: () => {
            this.orders.update((orders) =>
              orders.map((o) => (o._id === orderId ? { ...o, status: 'Cancelled' } : o)),
            );
          },
          error: (err) => alert(err.error?.message || 'Failed to refund order.'),
        });
    }
  }
}
