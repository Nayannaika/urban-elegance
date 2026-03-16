import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-payment',
  imports: [CommonModule],
  templateUrl: './payment.html',
})
export class UserPayment implements OnInit {
  private http = inject(HttpClient);
  savedCards = signal<any[]>([]);
  giftCardBalance = signal<number>(0);
  isLoading = signal(true);

  ngOnInit() {
    this.http
      .get<any>('http://localhost:5000/api/users/profile', { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.savedCards.set(data.savedCards || []);
          this.giftCardBalance.set(data.giftCardBalance || 0);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
        },
      });
  }
}
