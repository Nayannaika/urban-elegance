import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [ngClass]="[
        baseClasses,
        variantClasses[variant()],
        sizeClasses[size()],
        fullWidth() ? 'w-full' : '',
        disabled() ? 'opacity-50 cursor-not-allowed' : '',
      ]"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class Button {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  fullWidth = input<boolean>(false);

  baseClasses =
    'inline-flex items-center justify-center font-black uppercase tracking-[0.15em] transition-all transform active:scale-95 shadow-xl rounded-xl';

  variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-gray-900 text-white hover:bg-tss-red',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  sizeClasses: Record<ButtonSize, string> = {
    sm: 'py-2 px-4 text-xs',
    md: 'py-3.5 px-6 text-sm',
    lg: 'py-4 px-8 text-base',
  };
}
