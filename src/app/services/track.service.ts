import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Dsp, TrackDetail, TrackListItem, TrackStatus } from '../models/track.models';

@Injectable({ providedIn: 'root' })
export class TrackService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/tracks`;

  getTracks(status?: TrackStatus | ''): Observable<TrackListItem[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<TrackListItem[]>(this.baseUrl, { params });
  }

  getTrackById(id: string): Observable<TrackDetail> {
    return this.http.get<TrackDetail>(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: string, status: TrackStatus): Observable<TrackDetail> {
    return this.http.patch<TrackDetail>(`${this.baseUrl}/${id}/status`, { status });
  }

  distribute(id: string, dspIds: string[]): Observable<TrackDetail> {
    return this.http.post<TrackDetail>(`${this.baseUrl}/${id}/distribute`, { dspIds });
  }

  getDsps(): Observable<Dsp[]> {
    return this.http.get<Dsp[]>(`${environment.apiBaseUrl}/dsps`);
  }
}
