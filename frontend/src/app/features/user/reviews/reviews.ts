import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-reviews',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in-up delay-100">
      <h3 class="text-2xl font-bold font-outfit text-slate-900 mb-6">My Reviews</h3>

      <div *ngIf="isLoading()" class="animate-pulse space-y-6">
        <div class="h-32 bg-slate-200 rounded-2xl w-full"></div>
        <div class="h-32 bg-slate-200 rounded-2xl w-full"></div>
      </div>

      <div
        *ngIf="!isLoading() && reviews().length === 0"
        class="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100 border-dashed"
      >
        <svg
          class="mx-auto h-12 w-12 text-slate-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
        <h3 class="mt-4 text-sm font-medium text-slate-900">No reviews yet</h3>
        <p class="mt-1 text-sm text-slate-500 mb-6">
          Share your thoughts on products you've purchased.
        </p>
        <a
          routerLink="/products"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          Browse Products
        </a>
      </div>

      <div *ngIf="!isLoading() && reviews().length > 0" class="space-y-6">
        <div
          *ngFor="let review of reviews()"
          class="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow"
        >
          <div
            class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
          >
            <img
              [src]="review.product?.images?.[0] || 'https://via.placeholder.com/150'"
              alt="Product Image"
              class="h-full w-full object-cover object-center"
            />
          </div>

          <div class="flex-1">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="text-sm font-bold text-slate-900">
                  {{ review.product?.name || 'Unknown Product' }}
                </h4>
                <div class="flex items-center mt-1">
                  <ng-container *ngFor="let star of [1, 2, 3, 4, 5]">
                    <svg
                      class="h-4 w-4 flex-shrink-0"
                      [ngClass]="star <= review.rating ? 'text-yellow-400' : 'text-slate-200'"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      />
                    </svg>
                  </ng-container>
                </div>
              </div>
              <p class="text-xs text-slate-400 font-medium">
                {{ review.createdAt | date: 'mediumDate' }}
              </p>
            </div>
            <p class="mt-4 text-sm text-slate-600 font-inter leading-relaxed whitespace-pre-line">
              {{ review.comment }}
            </p>

            <div class="mt-6 flex space-x-4">
              <button
                class="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition-colors"
              >
                Edit Review
              </button>
              <button
                class="text-rose-500 hover:text-rose-700 text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class UserReviews implements OnInit {
  private http = inject(HttpClient);
  reviews = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.http
      .get<any[]>('http://localhost:5000/api/reviews/myreviews', { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.reviews.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
        },
      });
  }
}
