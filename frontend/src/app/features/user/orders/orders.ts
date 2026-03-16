import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
})
export class UserOrders implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.isLoading.set(true);
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.isLoading.set(false);
      },
    });
  }

  cancelOrder(orderId: string) {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: () => {
          this.fetchOrders();
        },
        error: (err) => {
          console.error('Failed to cancel order:', err);
          alert('Failed to cancel order: ' + (err.error?.message || err.message));
        },
      });
    }
  }

  returnOrder(orderId: string) {
    if (confirm('Are you sure you want to return this order?')) {
      this.orderService.returnOrder(orderId).subscribe({
        next: () => {
          this.fetchOrders();
        },
        error: (err) => {
          console.error('Failed to return order:', err);
          alert('Failed to return order: ' + (err.error?.message || err.message));
        },
      });
    }
  }
}
