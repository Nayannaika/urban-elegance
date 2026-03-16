import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category:
    | {
        _id: string;
        name: string;
      }
    | string; // Permit string for creating with just ID
  images: string[];
  sizes: string[];
  colors: string[];
  brand: string;
  stock: number;
  isFeatured: boolean;
  isNewArrival?: boolean;
  reviews?: {
    _id: string;
    user: string;
    name: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
  rating?: number;
  numReviews?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/products';

  getProducts(params?: any): Observable<Product[]> {
    return this.http.get<any>(this.apiUrl, { params }).pipe(map((res) => res.data || res));
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(map((res) => res.data || res));
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<any>(this.apiUrl, product).pipe(map((res) => res.data || res));
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, product).pipe(map((res) => res.data || res));
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  createReview(id: string, review: { rating: number; comment: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/reviews`, review, { withCredentials: true });
  }
}
