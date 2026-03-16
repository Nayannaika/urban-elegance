import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService, Product } from '../../core/services/product.service';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { switchMap } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCard, RouterLink],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);

  product = signal<Product | null>(null);
  similarProducts = signal<Product[]>([]);
  selectedImage = signal<string>('');
  selectedSize = signal<string | null>(null);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.route.data.subscribe(({ product }) => {
      this.isLoading.set(false);

      if (product) {
        console.log('Fetched Product Data:', product);
        this.product.set(product);

        if (product.images && product.images.length > 0) {
          this.selectedImage.set(product.images[0]);
        }

        // Fetch similar products from the same category
        if (product.category) {
          const categoryId =
            typeof product.category === 'object' ? (product.category as any)._id : product.category;

          this.productService.getProducts({ category: categoryId }).subscribe({
            next: (products) => {
              // Filter out the current product and limit to 4
              this.similarProducts.set(products.filter((p) => p._id !== product._id).slice(0, 4));
            },
          });
        }
      }
    });
  }

  setSelectedImage(image: string): void {
    this.selectedImage.set(image);
  }

  addToCart() {
    const currentProduct = this.product();
    if (currentProduct) {
      const size = this.selectedSize();
      if (!size && currentProduct.sizes && currentProduct.sizes.length > 0) {
        alert('Please select a size first.');
        return;
      }
      this.cartService.addToCart(currentProduct._id, 1, size || undefined).subscribe(() => {
        // Optional: Show toast notification
        console.log('Added to cart');
      });
    }
  }

  addToWishlist() {
    const currentProduct = this.product();
    if (currentProduct) {
      this.wishlistService.addToWishlist(currentProduct._id).subscribe(() => {
        console.log('Added to wishlist');
      });
    }
  }

  // Reviews functionality
  reviewRating = signal<number>(5);
  reviewComment = signal<string>('');
  isSubmittingReview = signal<boolean>(false);

  setRating(rating: number) {
    this.reviewRating.set(rating);
  }

  submitReview() {
    const currentProduct = this.product();
    const comment = this.reviewComment().trim();
    if (!currentProduct || !comment) return;

    this.isSubmittingReview.set(true);

    this.productService
      .createReview(currentProduct._id, {
        rating: this.reviewRating(),
        comment: comment,
      })
      .subscribe({
        next: () => {
          // Reset form
          this.reviewRating.set(5);
          this.reviewComment.set('');
          // Reload product to fetch new reviews
          this.productService.getProductById(currentProduct._id).subscribe((p) => {
            this.product.set(p);
            this.isSubmittingReview.set(false);
          });
        },
        error: (err) => {
          console.error('Failed to submit review', err);
          alert(
            err.error?.message ||
              'Failed to submit review. You may have already reviewed this product.',
          );
          this.isSubmittingReview.set(false);
        },
      });
  }
}
