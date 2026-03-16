import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { userGuard } from './core/guards/user.guard';
import { preventUnsavedChangesGuard } from './core/guards/prevent-unsaved-changes.guard';
import { productResolver } from './core/resolvers/product.resolver';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home').then((c) => c.Home) },
  {
    path: 'products',
    loadComponent: () => import('./features/products/products').then((c) => c.Products),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./features/products/product-details').then((c) => c.ProductDetails),
    resolve: { product: productResolver },
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./features/wishlist/wishlist').then((c) => c.Wishlist),
    canActivate: [userGuard],
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart').then((c) => c.Cart),
    canActivate: [userGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((c) => c.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((c) => c.Register),
    canDeactivate: [preventUnsavedChangesGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password').then((c) => c.ForgotPassword),
  },
  {
    path: 'reset-password/:token',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password').then((c) => c.ResetPassword),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'user',
    canActivate: [userGuard],
    loadChildren: () => import('./features/user/user.routes').then((m) => m.USER_ROUTES),
  },
];
