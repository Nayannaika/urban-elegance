import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { ProductService, Product } from '../services/product.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const productResolver: ResolveFn<Product | null> = (route, state) => {
  const productId = route.paramMap.get('id');
  const router = inject(Router);

  if (!productId) {
    router.navigate(['/products']);
    return of(null);
  }

  return inject(ProductService)
    .getProductById(productId)
    .pipe(
      catchError(() => {
        router.navigate(['/products']);
        return of(null);
      }),
    );
};
