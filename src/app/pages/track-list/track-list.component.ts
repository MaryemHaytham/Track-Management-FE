import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TrackService } from '../../services/track.service';
import { TrackListItem, TrackStatus } from '../../models/track.models';

@Component({
  selector: 'app-track-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './track-list.component.html',
  styleUrl: './track-list.component.scss'
})
export class TrackListComponent implements OnInit {
  private readonly trackService = inject(TrackService);

  private readonly allTracks = signal<TrackListItem[]>([]);
  selectedStatus = signal<TrackStatus | ''>('');
  loading = false;
  error = '';

  readonly tracks = computed(() => {
    const status = this.selectedStatus();
    const items = this.allTracks();
    return status ? items.filter((t) => t.status === status) : items;
  });

  readonly counts = computed(() => {
    const items = this.allTracks();
    return {
      total: items.length,
      draft: items.filter((t) => t.status === 'Draft').length,
      submitted: items.filter((t) => t.status === 'Submitted').length,
      distributed: items.filter((t) => t.status === 'Distributed').length
    };
  });

  ngOnInit(): void {
    this.loadTracks();
  }

  loadTracks(): void {
    this.loading = true;
    this.error = '';
    this.trackService.getTracks().subscribe({
      next: (tracks) => {
        this.allTracks.set(tracks);
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load the catalog. Confirm the API is running on http://localhost:5222.';
        this.loading = false;
      }
    });
  }

  setStatus(status: TrackStatus | ''): void {
    this.selectedStatus.set(status);
  }
}
