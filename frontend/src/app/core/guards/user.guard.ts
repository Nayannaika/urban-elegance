import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const userGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (typeof window !== 'undefined' && window.localStorage) {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'user' || payload.role === 'admin') {
          // Token exists and user is valid
          if (payload.exp && Date.now() >= payload.exp * 1000) {
            localStorage.removeItem('token');
            router.navigate(['/login']);
            return false;
          }
          return true;
        }
      } catch (e) {
        console.error('Error parsing token in guard', e);
      }
    }
  }

  // Not logged in
  router.navigate(['/login']);
  return false;
};
