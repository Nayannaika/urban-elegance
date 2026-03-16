import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
          (click)="onClose()"
        ></div>

        <!-- Modal Content -->
        <div
          class="relative bg-white rounded-3xl w-full max-w-md mx-4 shadow-2xl transform transition-all duration-300 scale-100 opacity-100 border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
        >
          <!-- Header -->
          <div
            class="px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur z-10"
          >
            <h2 class="text-xl font-black text-gray-900 tracking-tight">{{ title() }}</h2>
            <button
              (click)="onClose()"
              class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-tss-red hover:text-white transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-8 py-6 overflow-y-auto">
            <ng-content></ng-content>
          </div>

          <!-- Optional Footer Projection using named slot -->
          <div class="px-8 py-6 border-t border-gray-100 bg-gray-50 sticky bottom-0">
            <ng-content select="[modal-footer]"></ng-content>
          </div>
        </div>
      </div>
    }
  `,
})
export class Modal {
  isOpen = input.required<boolean>();
  title = input.required<string>();

  closed = output<void>();

  onClose() {
    this.closed.emit();
  }
}
