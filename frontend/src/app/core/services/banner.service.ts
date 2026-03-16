import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Banner {
  _id?: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  order: number;
}

@Injectable({
  providedIn: 'root',
})
export class BannerService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/banners';

  // Get active banners for the home page (public)
  getActiveBanners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(this.apiUrl);
  }

  // Admin: Get all banners (active and inactive)
  getAllBanners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(`${this.apiUrl}/all`);
  }

  // Admin: Create a new banner
  createBanner(banner: Banner): Observable<Banner> {
    return this.http.post<Banner>(this.apiUrl, banner);
  }

  // Admin: Update an existing banner
  updateBanner(id: string, banner: Partial<Banner>): Observable<Banner> {
    return this.http.put<Banner>(`${this.apiUrl}/${id}`, banner);
  }

  // Admin: Delete a banner
  deleteBanner(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
