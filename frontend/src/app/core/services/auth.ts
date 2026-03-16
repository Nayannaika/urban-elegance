import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Initialize subject based on existing local storage token
  private currentUserSubject = new BehaviorSubject<{ role: string | null; isLoggedIn: boolean }>(
    this.getInitialState(),
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  private getInitialState() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return { role: payload.role, isLoggedIn: true };
        } catch (e) {
          // Token is invalid, cleanup
          localStorage.removeItem('token');
        }
      }
    }
    return { role: null, isLoggedIn: false };
  }

  // Called from login components to update global state immediately
  setSession(token: string, role: string) {
    localStorage.setItem('token', token);
    this.currentUserSubject.next({ role, isLoggedIn: true });
  }

  logout() {
    this.http
      .post('http://localhost:5000/api/users/logout', {}, { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('token');
        }
        this.currentUserSubject.next({ role: null, isLoggedIn: false });
        this.router.navigate(['/login']);
      });
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value.isLoggedIn;
  }

  getUserRole(): string | null {
    return this.currentUserSubject.value.role;
  }

  getProfileRoute(): string {
    if (this.isLoggedIn()) {
      const role = this.getUserRole();
      if (role === 'admin') {
        return '/admin/dashboard';
      }
      return '/user';
    }
    return '/login';
  }

  forgotPassword(email: string) {
    return this.http.post('http://localhost:5000/api/users/forgotpassword', { email });
  }

  resetPassword(password: string, token: string) {
    return this.http.put(`http://localhost:5000/api/users/resetpassword/${token}`, { password });
  }
}
