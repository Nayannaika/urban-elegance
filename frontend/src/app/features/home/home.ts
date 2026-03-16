import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../core/services/product.service';
import { BannerService, Banner } from '../../core/services/banner.service';
import { CategoryService, Category } from '../../core/services/category.service';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ProductCard, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private bannerService = inject(BannerService);
  private categoryService = inject(CategoryService);

  newArrivals = signal<Product[]>([]);
  featuredProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  banners = signal<Banner[]>([]);
  currentBannerIndex = signal<number>(0);
  private slideInterval: any;

  ngOnInit(): void {
    // Fetch New Arrivals (limit to 4)
    this.productService.getProducts({ isNewArrival: 'true' }).subscribe({
      next: (products) => this.newArrivals.set(products.slice(0, 4)),
      error: (err) => console.error('Error fetching new arrivals', err),
    });

    // Fetch Featured Products (limit to 4)
    this.productService.getProducts({ isFeatured: 'true' }).subscribe({
      next: (products) => this.featuredProducts.set(products.slice(0, 4)),
      error: (err) => console.error('Error fetching featured products', err),
    });

    // Fetch Categories
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        const order = ['T-Shirts', 'Shirts', 'Pants', 'Sneakers'];
        const filtered = categories
          .filter((c) => order.includes(c.name))
          .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
        this.categories.set(filtered);
      },
      error: (err) => console.error('Error fetching categories', err),
    });

    this.bannerService.getActiveBanners().subscribe({
      next: (banners) => {
        this.banners.set(banners);
        if (banners.length > 1) {
          this.slideInterval = setInterval(() => {
            this.nextSlide();
          }, 3000);
        }
      },
      error: (err) => console.error('Error fetching banners', err),
    });
  }

  ngOnDestroy(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  nextSlide(): void {
    this.currentBannerIndex.update((idx) => (idx + 1) % this.banners().length);
  }

  setSlide(index: number): void {
    this.currentBannerIndex.set(index);
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = setInterval(() => {
        this.nextSlide();
      }, 3000);
    }
  }
}
