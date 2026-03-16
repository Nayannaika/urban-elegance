import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BannerService, Banner } from '../../../core/services/banner.service';
import { UploadService } from '../../../core/services/upload.service';

@Component({
  selector: 'app-banners',
  imports: [CommonModule, FormsModule],
  templateUrl: './banners.html',
  styleUrl: './banners.scss',
})
export class Banners implements OnInit {
  private bannerService = inject(BannerService);
  private uploadService = inject(UploadService);

  banners = signal<Banner[]>([]);
  isModalOpen = signal(false);
  editMode = signal(false);

  // Upload state
  selectedFile: File | null = null;
  uploadError: string = '';
  isUploading: boolean = false;

  newBanner: Partial<Banner> = {
    imageUrl: '',
    link: '',
    isActive: true,
    order: 0,
  };

  currentBannerId: string | null = null;

  ngOnInit() {
    this.loadBanners();
  }

  loadBanners() {
    this.bannerService.getAllBanners().subscribe({
      next: (data) => this.banners.set(data),
      error: (err) => console.error('Failed to load banners', err),
    });
  }

  openModal(banner?: Banner) {
    this.selectedFile = null;
    this.uploadError = '';

    if (banner) {
      this.editMode.set(true);
      this.currentBannerId = banner._id!;
      this.newBanner = { ...banner };
    } else {
      this.editMode.set(false);
      this.currentBannerId = null;
      this.newBanner = { imageUrl: '', link: '', isActive: true, order: 0 };
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0] as File;
    if (file) {
      if (file.size > 5000000) {
        // 5MB limit
        this.uploadError = 'File size exceeds 5MB limit.';
        this.selectedFile = null;
      } else {
        this.uploadError = '';
        this.selectedFile = file;
      }
    }
  }

  saveBanner() {
    if (this.uploadError) return;

    if (this.selectedFile) {
      this.isUploading = true;
      this.uploadService.uploadFile(this.selectedFile).subscribe({
        next: (res) => {
          this.newBanner.imageUrl = `http://localhost:5000${res.image}`;
          this.executeSave();
        },
        error: (err) => {
          console.error('Upload failed', err);
          this.uploadError = 'Image upload failed. Please try again.';
          this.isUploading = false;
        },
      });
    } else {
      this.executeSave();
    }
  }

  private executeSave() {
    if (this.editMode() && this.currentBannerId) {
      this.bannerService.updateBanner(this.currentBannerId, this.newBanner).subscribe({
        next: () => {
          this.loadBanners();
          this.closeModal();
          this.isUploading = false;
        },
        error: (err) => {
          console.error('Error updating banner', err);
          this.isUploading = false;
        },
      });
    } else {
      this.bannerService.createBanner(this.newBanner as Banner).subscribe({
        next: () => {
          this.loadBanners();
          this.closeModal();
          this.isUploading = false;
        },
        error: (err) => {
          console.error('Error creating banner', err);
          this.isUploading = false;
        },
      });
    }
  }

  deleteBanner(id: string) {
    if (confirm('Are you sure you want to delete this banner?')) {
      this.bannerService.deleteBanner(id).subscribe({
        next: () => this.loadBanners(),
        error: (err) => console.error('Error deleting banner', err),
      });
    }
  }
}
