import { Component, input, forwardRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-2">
      <label [for]="id" class="text-xs font-black text-gray-900 uppercase tracking-widest">{{
        label()
      }}</label>
      <input
        [id]="id"
        [type]="type()"
        [placeholder]="placeholder()"
        [value]="value()"
        [disabled]="disabled()"
        (input)="onInputChange($event)"
        (blur)="onTouched()"
        [ngClass]="[
          'w-full px-5 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-tss-red transition-colors font-medium',
          hasError() ? 'border-red-500 bg-red-50' : 'border-gray-100',
        ]"
      />
      @if (hasError()) {
        <span class="text-xs text-red-500 font-bold uppercase tracking-wider">{{
          errorMessage()
        }}</span>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Input),
      multi: true,
    },
  ],
})
export class Input implements ControlValueAccessor {
  label = input.required<string>();
  type = input<'text' | 'email' | 'password' | 'number'>('text');
  placeholder = input<string>('');

  // To work with form control error states
  controlErrors = input<any>(null);
  controlTouched = input<boolean>(false);
  errorMessages = input<Record<string, string>>({});

  value = signal<string>('');
  disabled = signal<boolean>(false);

  // Unique ID for label and input pairing
  id = 'input-' + Math.random().toString(36).substr(2, 9);

  onChange = (value: any) => {};
  onTouched = () => {};

  hasError = computed(() => {
    return !!this.controlErrors() && this.controlTouched();
  });

  errorMessage = computed(() => {
    const errors = this.controlErrors();
    const messages = this.errorMessages();
    if (errors) {
      const firstErrorKey = Object.keys(errors)[0];
      return messages[firstErrorKey] || 'Invalid input';
    }
    return '';
  });

  onInputChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  writeValue(val: string): void {
    if (val !== undefined && val !== null) {
      this.value.set(val);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
