import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../core/services/product.service';
import { CategoryService, Category } from '../../../core/services/category.service';
import { UploadService } from '../../../core/services/upload.service';
import { forkJoin, of, switchMap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const ALLOWED_CATEGORIES = ['T-Shirts', 'Shirts', 'Pants', 'Sneakers', 'New Arrivals', 'Featured'];

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
})
export class AdminProducts implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private uploadService = inject(UploadService);

  // Data Signals
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Navigation State
  activeTab = signal<string>('T-Shirts');
  allowedTabs = ALLOWED_CATEGORIES;

  // Computed
  activeCategory = computed(() => {
    return this.categories().find((c) => c.name === this.activeTab());
  });

  filteredProducts = computed(() => {
    const activeTabName = this.activeTab();
    if (activeTabName === 'New Arrivals') {
      return this.products().filter((p) => p.isNewArrival);
    }
    if (activeTabName === 'Featured') {
      return this.products().filter((p) => p.isFeatured);
    }

    const activeCat = this.activeCategory();
    if (!activeCat) return [];
    return this.products().filter((p) => {
      const cat = p.category as any;
      return cat?._id === activeCat._id;
    });
  });

  // Category Modal State
  isCategoryModalOpen = signal(false);
  categoryForm = signal<Partial<Category>>({ name: '', description: '', image: '' });
  categoryImageFile: File | null = null;
  categoryUploadError = '';

  // Product Modal State
  isProductModalOpen = signal(false);
  editingProductId = signal<string | null>(null);
  productForm = signal({
    name: '',
    description: '',
    price: 0,
    brand: '',
    stock: 0,
    sizesText: '',
    colorsText: '',
    isFeatured: false,
    isNewArrival: false,
  });

  productFiles: (File | null)[] = [null, null, null, null];
  existingProductImageUrls: string[] = [];
  productUploadError = '';
  isUploading = false;

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading.set(true);
    forkJoin({
      products: this.productService.getProducts(),
      categories: this.categoryService.getCategories(),
    }).subscribe({
      next: (res) => {
        const existingNames = res.categories.map((c) => c.name);
        const missing = ALLOWED_CATEGORIES.filter((c) => !existingNames.includes(c));

        if (missing.length > 0) {
          // Auto-seed missing categories
          const createTasks = missing.map((m) =>
            this.categoryService.createCategory({
              name: m,
              description: `${m} Category`,
              image: '',
            }),
          );
          forkJoin(createTasks).subscribe(() => {
            this.fetchRawData(); // Refetch after seeding
          });
        } else {
          this.products.set(res.products);
          this.categories.set(res.categories.filter((c) => ALLOWED_CATEGORIES.includes(c.name)));
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('Failed to fetch data', err);
        this.error.set('Unable to load inventory data.');
        this.isLoading.set(false);
      },
    });
  }

  private fetchRawData() {
    forkJoin({
      products: this.productService.getProducts(),
      categories: this.categoryService.getCategories(),
    }).subscribe((res) => {
      this.products.set(res.products);
      this.categories.set(res.categories.filter((c) => ALLOWED_CATEGORIES.includes(c.name)));
      this.isLoading.set(false);
    });
  }

  setActiveTab(tabName: string) {
    this.activeTab.set(tabName);
  }

  // ============== CATEGORY MANAGEMENT ==============

  openCategoryModal() {
    const cat = this.activeCategory();
    if (!cat) return;
    this.categoryImageFile = null;
    this.categoryUploadError = '';
    this.categoryForm.set({ ...cat });
    this.isCategoryModalOpen.set(true);
  }

  onCategoryFileSelected(event: any) {
    const file = event.target.files[0] as File;
    if (file) {
      if (file.size > 5000000) {
        this.categoryUploadError = 'File size exceeds 5MB limit.';
        this.categoryImageFile = null;
      } else {
        this.categoryUploadError = '';
        this.categoryImageFile = file;
      }
    }
  }

  saveCategory() {
    if (this.categoryUploadError) return;
    this.isUploading = true;
    const cat = this.activeCategory();
    if (!cat) return;

    if (this.categoryImageFile) {
      this.uploadService.uploadFile(this.categoryImageFile).subscribe({
        next: (res) => {
          this.categoryForm.update((form) => ({
            ...form,
            image: `http://localhost:5000${res.image}`,
          }));
          this.executeCategorySave();
        },
        error: (err) => {
          console.error('Category image upload failed', err);
          this.categoryUploadError = 'Upload failed. Try again.';
          this.isUploading = false;
        },
      });
    } else {
      this.executeCategorySave();
    }
  }

  private executeCategorySave() {
    const cat = this.activeCategory();
    const payload = this.categoryForm() as Category;
    this.categoryService.updateCategory(cat!._id!, payload).subscribe({
      next: () => {
        this.fetchData();
        this.isCategoryModalOpen.set(false);
        this.isUploading = false;
      },
      error: (err) => {
        console.error('Category Save Error', err);
        alert(err.error?.message || 'Failed to save category');
        this.isUploading = false;
      },
    });
  }

  // ============== PRODUCT MANAGEMENT ==============

  openProductModal(product?: Product) {
    this.productFiles = [null, null, null, null];
    this.productUploadError = '';

    if (product) {
      this.editingProductId.set(product._id);
      this.existingProductImageUrls = [...product.images];
      this.productForm.set({
        name: product.name,
        description: product.description || '',
        price: product.price,
        brand: product.brand || '',
        stock: product.stock,
        sizesText: product.sizes?.join(', ') || '',
        colorsText: product.colors?.join(', ') || '',
        isFeatured: product.isFeatured || false,
        isNewArrival: product.isNewArrival || false,
      });
    } else {
      this.editingProductId.set(null);
      this.existingProductImageUrls = [];
      this.productForm.set({
        name: '',
        description: '',
        price: 0,
        brand: '',
        stock: 0,
        sizesText: '',
        colorsText: '',
        isFeatured: false,
        isNewArrival: false,
      });
    }
    this.isProductModalOpen.set(true);
  }

  onProductFileSelected(event: any, index: number) {
    const file = event.target.files[0] as File;
    if (file) {
      if (file.size > 5000000) {
        this.productUploadError = `File ${index + 1} exceeds 5MB limit.`;
        this.productFiles[index] = null;
      } else {
        this.productUploadError = '';
        this.productFiles[index] = file;
      }
    }
  }

  saveProduct() {
    if (this.productUploadError) return;
    this.isUploading = true;

    // Prepare Upload Tasks only for slots that have a new file
    const uploadTasks = this.productFiles.map((file, index) => {
      if (file) {
        return this.uploadService.uploadFile(file).pipe(
          map((res) => `http://localhost:5000${res.image}`),
          catchError((err) => {
            console.error(`Upload error for file ${index}`, err);
            return of(null as string | null);
          }),
        );
      }
      // If no new file but we are editing, retain the old image at this index
      return of(this.existingProductImageUrls[index] || null);
    });

    forkJoin(uploadTasks).subscribe((urls) => {
      // Filter out nulls/failures to get the final active image URLs
      const finalImages = urls.filter((url): url is string => url !== null);
      this.executeProductSave(finalImages);
    });
  }

  private executeProductSave(images: string[]) {
    const formVals = this.productForm();
    let categoryId: string;

    const activeTabName = this.activeTab();
    if (activeTabName === 'New Arrivals' || activeTabName === 'Featured') {
      // If editing from these tabs, keep existing category. If adding new (which we might prevent in UI), we need a category.
      // Let's ensure category is provided or handled. For now, if editing, we shouldn't change category.
      // The current UI design implies "Add Product" button will be associated with a specific category tab.
      // We will handle hiding the "Add Product" button for 'New Arrivals' and 'Featured' in HTML.
      // For editing, we just need the existing product's category.
      const isEdit = !!this.editingProductId();
      if (isEdit) {
        const existingProduct = this.products().find((p) => p._id === this.editingProductId());
        if (existingProduct) {
          categoryId =
            typeof existingProduct.category === 'string'
              ? existingProduct.category
              : (existingProduct.category as any)?._id;
        } else {
          alert('Cannot find original category for edit.');
          this.isUploading = false;
          return;
        }
      } else {
        alert(
          'Cannot add a new product directly from ' +
            activeTabName +
            ' tab. Please switch to a specific category.',
        );
        this.isUploading = false;
        return;
      }
    } else {
      // 1. Get active category ID
      const activeCategory = this.categories().find((c) => c.name === activeTabName);
      if (!activeCategory) {
        alert('No active category selected.');
        this.isUploading = false;
        return;
      }
      categoryId = activeCategory._id!;
    }

    // 2. Build payload
    const payload: Partial<Product> = {
      name: formVals.name,
      description: formVals.description,
      price: formVals.price,
      stock: formVals.stock,
      brand: formVals.brand,
      isFeatured: formVals.isFeatured,
      sizes: formVals.sizesText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s),
      colors: formVals.colorsText
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c),
      images: images,
      category: categoryId,
      isNewArrival: formVals.isNewArrival,
    };

    const isEdit = !!this.editingProductId();
    const req = isEdit
      ? this.productService.updateProduct(this.editingProductId()!, payload)
      : this.productService.createProduct(payload);

    req.subscribe({
      next: () => {
        this.fetchData();
        this.isProductModalOpen.set(false);
        this.isUploading = false;
      },
      error: (err) => {
        console.error('Product save error', err);
        alert(err.error?.message || 'Failed to save product');
        this.isUploading = false;
      },
    });
  }

  deleteProduct(id: string) {
    if (confirm('Delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => this.fetchData(),
        error: (err) => alert('Failed to delete product'),
      });
    }
  }
}
