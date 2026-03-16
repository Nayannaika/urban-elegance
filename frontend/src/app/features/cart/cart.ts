import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService, CartItem, Cart as CartModel } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { OrderService } from '../../core/services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  cart: any = null;
  isLoading = true;
  isCheckingOut = false;

  ngOnInit() {
    this.fetchCart();
  }

  fetchCart() {
    this.isLoading = true;
    this.cartService.getCart().subscribe((cart) => {
      this.cart = cart;
      this.isLoading = false;
    });
  }

  updateQuantity(item: CartItem, newQuantity: number) {
    if (newQuantity < 1) return;
    this.cartService.updateQuantity(item._id!, newQuantity).subscribe((cart) => {
      this.cart = cart;
    });
  }

  removeItem(itemId: string) {
    this.cartService.removeItem(itemId).subscribe((cart) => {
      this.cart = cart;
    });
  }

  moveToWishlist(item: CartItem) {
    this.wishlistService.addToWishlist(item.product._id).subscribe(() => {
      this.removeItem(item._id!);
    });
  }

  get subtotal(): number {
    return (
      this.cart?.items.reduce(
        (sum: number, item: any) => sum + (item.product?.price || 0) * item.quantity,
        0,
      ) || 0
    );
  }

  get tax(): number {
    // Basic 5% tax or something similar
    return Math.round(this.subtotal * 0.05);
  }

  get total(): number {
    return this.subtotal + this.tax; // Free shipping
  }

  ngOnDestroy() {
    // Clean up subscriptions if any
  }

  checkout() {
    this.isCheckingOut = true;
    this.orderService.createOrder('Cash on Delivery').subscribe({
      next: (order) => {
        this.isCheckingOut = false;
        // Navigate to my orders
        this.router.navigate(['/user/orders']);
      },
      error: (err) => {
        this.isCheckingOut = false;
        alert(
          err.error?.message ||
            'Failed to place order. Please check your address or stock availability.',
        );
      },
    });
  }
}
