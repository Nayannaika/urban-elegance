import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { CartService } from './cart.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private cartService = inject(CartService);
  private apiUrl = 'http://localhost:5000/api/orders';

  createOrder(
    paymentMethod: string = 'Cash on Delivery',
    shippingAddressIndex?: number,
  ): Observable<any> {
    return this.http
      .post(this.apiUrl, { paymentMethod, shippingAddressIndex }, { withCredentials: true })
      .pipe(
        tap(() => {
          // Automatically fetch cart again to clear it visually on the frontend
          this.cartService.getCart().subscribe();
        }),
      );
  }

  getMyOrders(): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/myorders`, { withCredentials: true })
      .pipe(map((res) => res.data || res));
  }

  cancelOrder(orderId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${orderId}/cancel`, {}, { withCredentials: true });
  }

  returnOrder(orderId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${orderId}/return`, {}, { withCredentials: true });
  }
}
