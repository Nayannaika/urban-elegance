import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

export interface Wishlist {
  _id: string;
  user: string;
  products: any[];
}

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private http = inject(HttpClient);

  public wishlistItems = new BehaviorSubject<any[]>([]);

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage && localStorage.getItem('token')) {
      this.getWishlist().subscribe();
    }
  }

  getWishlist() {
    return this.http
      .get<Wishlist>('http://localhost:5000/api/wishlist', { withCredentials: true })
      .pipe(
        tap((wishlist) => {
          this.wishlistItems.next(wishlist?.products || []);
        }),
      );
  }

  addToWishlist(productId: string) {
    return this.http
      .post<Wishlist>(
        'http://localhost:5000/api/wishlist',
        { productId },
        { withCredentials: true },
      )
      .pipe(
        tap((wishlist) => {
          this.wishlistItems.next(wishlist?.products || []);
        }),
      );
  }

  removeFromWishlist(productId: string) {
    return this.http
      .delete<Wishlist>(`http://localhost:5000/api/wishlist/${productId}`, {
        withCredentials: true,
      })
      .pipe(
        tap((wishlist) => {
          this.wishlistItems.next(wishlist?.products || []);
        }),
      );
  }
}
