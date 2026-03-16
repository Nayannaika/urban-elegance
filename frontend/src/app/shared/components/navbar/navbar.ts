import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  cartService = inject(CartService);
  wishlistService = inject(WishlistService);
  authService = inject(Auth);

  cartCount$ = this.cartService.cartItemCount;
  wishlist$ = this.wishlistService.wishlistItems;

  get profileRoute(): string {
    return this.authService.getProfileRoute();
  }

  ngOnInit() {}
}
