import { Routes } from '@angular/router';

import { UserDashboard } from './dashboard/dashboard';
import { UserProfile } from './profile/profile';
import { UserOrders } from './orders/orders';
import { UserPayment } from './payment/payment';
import { UserReviews } from './reviews/reviews';

export const USER_ROUTES: Routes = [
  {
    path: '',
    component: UserDashboard,
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', component: UserProfile },
      { path: 'orders', component: UserOrders },
      { path: 'payment', component: UserPayment },
      { path: 'reviews', component: UserReviews },
    ],
  },
];
