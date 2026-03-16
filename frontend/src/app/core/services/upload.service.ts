import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/upload';

  uploadFile(file: File): Observable<{ message: string; image: string }> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<{ message: string; image: string }>(this.apiUrl, formData);
  }
}
