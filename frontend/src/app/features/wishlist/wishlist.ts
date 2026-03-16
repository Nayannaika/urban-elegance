import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss',
})
export class Wishlist implements OnInit {
  private wishlistService = inject(WishlistService);
  private cartService = inject(CartService);

  wishlistItems: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.wishlistService.wishlistItems.subscribe((items) => {
      this.wishlistItems = items;
      this.isLoading = false;
    });
  }

  removeFromWishlist(productId: string) {
    this.wishlistService.removeFromWishlist(productId).subscribe();
  }

  moveToCart(product: any) {
    // Basic logic: Add to cart, then remove from wishlist
    this.cartService.addToCart(product._id).subscribe(() => {
      this.removeFromWishlist(product._id);
    });
  }
}
