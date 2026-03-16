import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { Router } from '@angular/router';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const http = inject(HttpClient);
  const router = inject(Router);

  const token = localStorage.getItem('token');

  const addToken = (request: HttpRequest<unknown>, t: string) =>
    request.clone({ setHeaders: { Authorization: `Bearer ${t}` } });

  let clonedRequest = token ? addToken(req, token) : req;

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        !req.url.includes('/api/users/login') &&
        !req.url.includes('/api/users/refresh')
      ) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return http
            .post<any>('http://localhost:5000/api/users/refresh', {}, { withCredentials: true })
            .pipe(
              switchMap((res) => {
                isRefreshing = false;
                localStorage.setItem('token', res.token);
                refreshTokenSubject.next(res.token);
                // Retry the original request with the new token
                return next(addToken(req, res.token));
              }),
              catchError((err) => {
                isRefreshing = false;
                refreshTokenSubject.next(null);
                localStorage.removeItem('token');
                router.navigate(['/login']);
                return throwError(() => err);
              }),
            );
        } else {
          // While refreshing, queue the request until we have a new token
          return refreshTokenSubject.pipe(
            filter((t) => t !== null),
            take(1),
            switchMap((t) => next(addToken(req, t!))),
          );
        }
      }
      return throwError(() => error);
    }),
  );
};
