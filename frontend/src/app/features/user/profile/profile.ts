import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
})
export class UserProfile implements OnInit {
  private http = inject(HttpClient);

  user = signal<any>(null);
  isLoading = signal(true);
  isEditing = signal(false);
  isSaving = signal(false);

  // Form Models
  editData = {
    name: '',
    email: '',
    phone: '',
    addresses: [] as any[],
  };

  ngOnInit() {
    this.fetchProfile();
  }

  fetchProfile() {
    this.isLoading.set(true);
    this.http.get('http://localhost:5000/api/users/profile', { withCredentials: true }).subscribe({
      next: (data: any) => {
        this.user.set(data);
        this.initEditData(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      },
    });
  }

  initEditData(data: any) {
    this.editData = {
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      // Clone addresses to avoid direct mutation
      addresses: data.addresses ? JSON.parse(JSON.stringify(data.addresses)) : [],
    };
  }

  toggleEdit() {
    if (this.isEditing()) {
      // Cancel edit - reset data
      this.initEditData(this.user());
    }
    this.isEditing.set(!this.isEditing());
  }

  addAddress() {
    this.editData.addresses.push({
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      isDefault: this.editData.addresses.length === 0,
    });
  }

  removeAddress(index: number) {
    this.editData.addresses.splice(index, 1);
  }

  setDefaultAddress(index: number) {
    this.editData.addresses.forEach((addr, i) => {
      addr.isDefault = i === index;
    });
  }

  saveProfile() {
    this.isSaving.set(true);

    // Validate we have at least name and email
    if (!this.editData.name || !this.editData.email) {
      alert('Name and email are required.');
      this.isSaving.set(false);
      return;
    }

    this.http
      .put('http://localhost:5000/api/users/profile', this.editData, { withCredentials: true })
      .subscribe({
        next: (updatedData: any) => {
          this.user.set(updatedData);
          this.initEditData(updatedData);
          this.isEditing.set(false);
          this.isSaving.set(false);
        },
        error: (err) => {
          console.error('Error saving profile', err);
          alert('Failed to save profile updates.');
          this.isSaving.set(false);
        },
      });
  }
}
