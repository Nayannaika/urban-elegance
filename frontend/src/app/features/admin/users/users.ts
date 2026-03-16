import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.html',
})
export class AdminUsers implements OnInit {
  private http = inject(HttpClient);

  users = signal<UserData[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.isLoading.set(true);
    this.http
      .get<UserData[]>('http://localhost:5000/api/users', { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.users.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to fetch users', err);
          this.error.set('Unable to load the user directory.');
          this.isLoading.set(false);
        },
      });
  }

  toggleBlock(userId: string) {
    this.http
      .put(`http://localhost:5000/api/users/${userId}/block`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          // Optimistic UI update
          this.users.update((users) =>
            users.map((user) =>
              user._id === userId
                ? { ...user, status: user.status === 'active' ? 'blocked' : 'active' }
                : user,
            ),
          );
        },
        error: (err) => alert(err.error?.message || 'Failed to alter user status.'),
      });
  }

  deleteUser(userId: string) {
    if (
      confirm('Are you absolutely sure you want to delete this user? This action cannot be undone.')
    ) {
      this.http
        .delete(`http://localhost:5000/api/users/${userId}`, { withCredentials: true })
        .subscribe({
          next: () => {
            this.users.update((users) => users.filter((user) => user._id !== userId));
          },
          error: (err) => alert(err.error?.message || 'Failed to delete user.'),
        });
    }
  }
}
