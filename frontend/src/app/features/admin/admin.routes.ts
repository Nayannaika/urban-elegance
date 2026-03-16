import { Routes } from '@angular/router';

import { AdminLayout } from './layout/layout';
import { AdminDashboard } from './dashboard/dashboard';
import { AdminUsers } from './users/users';
import { AdminProducts } from './products/products';
import { AdminOrders } from './orders/orders';
import { AdminAnalytics } from './analytics/analytics';
import { Banners as AdminBanners } from './banners/banners';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboard },
      { path: 'users', component: AdminUsers },
      { path: 'products', component: AdminProducts },
      { path: 'orders', component: AdminOrders },
      { path: 'analytics', component: AdminAnalytics },
      { path: 'banners', component: AdminBanners },
    ],
  },
];
