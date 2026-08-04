import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TrackService } from '../../services/track.service';
import { Dsp, TrackDetail, TrackStatus } from '../../models/track.models';

@Component({
  selector: 'app-track-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './track-detail.component.html',
  styleUrl: './track-detail.component.scss'
})
export class TrackDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly trackService = inject(TrackService);

  track: TrackDetail | null = null;
  dsps: Dsp[] = [];
  selectedDspIds = new Set<string>();
  selectedStatus: TrackStatus = 'Draft';
  loading = false;
  actionLoading = false;
  error = '';
  actionMessage = '';
  actionError = '';

  readonly statuses: TrackStatus[] = ['Draft', 'Submitted', 'Distributed'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Track id is missing.';
      return;
    }

    this.loading = true;
    this.trackService.getTrackById(id).subscribe({
      next: (track) => {
        this.track = track;
        this.selectedStatus = track.status;
        this.loading = false;
      },
      error: () => {
        this.error = 'Track not found or API is unavailable.';
        this.loading = false;
      }
    });

    this.trackService.getDsps().subscribe({
      next: (dsps) => (this.dsps = dsps),
      error: () => (this.dsps = [])
    });
  }

  toggleDsp(id: string, checked: boolean): void {
    if (checked) {
      this.selectedDspIds.add(id);
    } else {
      this.selectedDspIds.delete(id);
    }
  }

  isDspSelected(id: string): boolean {
    return this.selectedDspIds.has(id);
  }

  isAlreadyDistributed(dspId: string): boolean {
    return !!this.track?.distributions.some((d) => d.dspId === dspId);
  }

  updateStatus(): void {
    if (!this.track) {
      return;
    }

    this.actionLoading = true;
    this.actionError = '';
    this.actionMessage = '';

    this.trackService.updateStatus(this.track.id, this.selectedStatus).subscribe({
      next: (track) => {
        this.track = track;
        this.selectedStatus = track.status;
        this.actionMessage = `Status updated to ${track.status}.`;
        this.actionLoading = false;
      },
      error: (err) => {
        this.actionError = err?.error?.error ?? 'Could not update status.';
        this.actionLoading = false;
      }
    });
  }

  distribute(): void {
    if (!this.track || this.selectedDspIds.size === 0) {
      return;
    }

    this.actionLoading = true;
    this.actionError = '';
    this.actionMessage = '';

    this.trackService.distribute(this.track.id, [...this.selectedDspIds]).subscribe({
      next: (track) => {
        this.track = track;
        this.selectedStatus = track.status;
        this.selectedDspIds.clear();
        this.actionMessage = 'Track submitted to selected DSPs.';
        this.actionLoading = false;
      },
      error: (err) => {
        this.actionError = err?.error?.error ?? 'Could not distribute track.';
        this.actionLoading = false;
      }
    });
  }
}
