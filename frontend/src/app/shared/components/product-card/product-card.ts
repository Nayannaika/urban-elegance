import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/services/product.service';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  product = input.required<Product>();

  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private authService = inject(Auth);
  private router = inject(Router);

  addToCart(event: Event) {
    event.stopPropagation(); // prevent navigating to product details
    event.preventDefault();

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const defaultSize =
      this.product().sizes && this.product().sizes.length > 0 ? this.product().sizes[0] : undefined;

    this.cartService.addToCart(this.product()._id, 1, defaultSize).subscribe(() => {
      console.log('Added to cart:', this.product().name);
    });
  }

  addToWishlist(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.wishlistService.addToWishlist(this.product()._id).subscribe(() => {
      console.log('Added to wishlist from card');
    });
  }
}
