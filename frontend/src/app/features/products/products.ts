import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../core/services/product.service';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductCard],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private categoryService = inject(CategoryService);

  products = signal<Product[]>([]);
  isLoading = signal<boolean>(true);
  pageTitle = signal<string>('Explore Products');
  pageSubtitle = signal<string>(
    'Curated selection of high-performance architectural components for modern spaces.',
  );

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.isLoading.set(true);
      const categoryId = params.get('category');
      const isNewArrival = params.get('isNewArrival');
      const isFeatured = params.get('isFeatured');

      const filterParams: any = {};
      if (categoryId) filterParams.category = categoryId;
      if (isNewArrival) filterParams.isNewArrival = isNewArrival;
      if (isFeatured) filterParams.isFeatured = isFeatured;

      // Update Page Title
      if (isNewArrival === 'true') {
        this.pageTitle.set('New Arrivals');
        this.pageSubtitle.set('Be the first to wear our latest premium drops.');
      } else if (isFeatured === 'true') {
        this.pageTitle.set('Featured Collection');
        this.pageSubtitle.set('Handpicked styles that define modern elegance.');
      } else if (categoryId) {
        this.categoryService.getCategories().subscribe((categories) => {
          const category = categories.find((c) => c._id === categoryId);
          if (category) {
            this.pageTitle.set(category.name);
            this.pageSubtitle.set(category.description || `Premium selection of ${category.name}.`);
          }
        });
      } else {
        this.pageTitle.set('Explore Products');
        this.pageSubtitle.set(
          'Curated selection of high-performance architectural components for modern spaces.',
        );
      }

      this.productService.getProducts(filterParams).subscribe({
        next: (products) => {
          this.products.set(products);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error fetching products', err);
          this.isLoading.set(false);
        },
      });
    });
  }
}
