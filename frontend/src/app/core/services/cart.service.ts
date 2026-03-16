import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

export interface CartItem {
  _id?: string;
  product: any;
  quantity: number;
  size?: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);

  // Reactive state for cart items count
  public cartItemCount = new BehaviorSubject<number>(0);

  constructor() {
    // Optionally fetch cart on init if we have a token
    if (typeof window !== 'undefined' && window.localStorage && localStorage.getItem('token')) {
      this.getCart().subscribe();
    }
  }

  getCart() {
    return this.http.get<Cart>('http://localhost:5000/api/cart', { withCredentials: true }).pipe(
      tap((cart) => {
        const count = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
        this.cartItemCount.next(count);
      }),
    );
  }

  addToCart(productId: string, quantity: number = 1, size?: string) {
    return this.http
      .post<Cart>(
        'http://localhost:5000/api/cart',
        { productId, quantity, size },
        { withCredentials: true },
      )
      .pipe(
        tap((cart) => {
          const count = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
          this.cartItemCount.next(count);
        }),
      );
  }

  updateQuantity(itemId: string, quantity: number) {
    return this.http
      .put<Cart>(
        `http://localhost:5000/api/cart/${itemId}`,
        { quantity },
        { withCredentials: true },
      )
      .pipe(
        tap((cart) => {
          const count = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
          this.cartItemCount.next(count);
        }),
      );
  }

  removeItem(itemId: string) {
    return this.http
      .delete<Cart>(`http://localhost:5000/api/cart/${itemId}`, { withCredentials: true })
      .pipe(
        tap((cart) => {
          const count = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
          this.cartItemCount.next(count);
        }),
      );
  }
}
