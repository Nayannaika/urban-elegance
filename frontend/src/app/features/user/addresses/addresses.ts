import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-addresses',
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in-up delay-100">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-2xl font-bold font-outfit text-slate-900">Manage Addresses</h3>
        <button
          class="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none flex items-center space-x-2 text-sm"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            ></path>
          </svg>
          <span>Add New</span>
        </button>
      </div>

      <div *ngIf="isLoading()" class="animate-pulse flex space-x-4">
        <div class="flex-1 space-y-4 py-1">
          <div class="h-32 bg-slate-200 rounded-xl"></div>
        </div>
      </div>

      <div
        *ngIf="!isLoading() && addresses().length === 0"
        class="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed"
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          ></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-slate-900">No addresses</h3>
        <p class="mt-1 text-sm text-slate-500">
          Get started by adding a new address for faster checkout.
        </p>
      </div>

      <div
        *ngIf="!isLoading() && addresses().length > 0"
        class="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div
          *ngFor="let address of addresses()"
          class="bg-white border p-6 rounded-2xl shadow-sm relative group transition-all"
          [ngClass]="{
            'border-indigo-500 ring-1 ring-indigo-500': address.isDefault,
            'border-slate-200 hover:border-slate-300': !address.isDefault,
          }"
        >
          <span
            *ngIf="address.isDefault"
            class="absolute top-0 right-0 -mt-2 -mr-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 shadow-sm border border-indigo-200"
          >
            Default
          </span>

          <h4 class="text-sm font-bold text-slate-900 mb-2 truncate">{{ address.street }}</h4>
          <p class="text-sm text-slate-600 font-inter">
            {{ address.city }}, {{ address.state }} {{ address.zip }}
          </p>
          <p class="text-sm text-slate-600 font-inter">{{ address.country }}</p>

          <div
            class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          >
            <button
              class="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition-colors"
            >
              Edit
            </button>
            <button
              class="text-rose-500 hover:text-rose-700 text-sm font-semibold transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class UserAddresses implements OnInit {
  private http = inject(HttpClient);
  addresses = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.http
      .get<any>('http://localhost:5000/api/users/profile', { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.addresses.set(data.addresses || []);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
        },
      });
  }
}
