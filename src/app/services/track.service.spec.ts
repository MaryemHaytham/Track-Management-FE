import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { TrackDetail, TrackListItem } from '../models/track.models';
import { TrackService } from './track.service';

describe('TrackService', () => {
  let service: TrackService;
  let httpMock: HttpTestingController;

  const listItem: TrackListItem = {
    id: 't1',
    title: 'Midnight Drive',
    artistId: 'a1',
    artistName: 'Nova',
    isrc: 'USRC17607839',
    releaseDate: '2024-01-01',
    genre: 'Pop',
    status: 'Draft'
  };

  const detail: TrackDetail = {
    ...listItem,
    distributions: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(TrackService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request all tracks', () => {
    service.getTracks().subscribe((tracks) => {
      expect(tracks).toEqual([listItem]);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tracks`);
    expect(req.request.method).toBe('GET');
    req.flush([listItem]);
  });

  it('should request tracks filtered by status', () => {
    service.getTracks('Submitted').subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiBaseUrl}/tracks` && r.params.get('status') === 'Submitted'
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should request a track by id', () => {
    service.getTrackById('t1').subscribe((track) => {
      expect(track.id).toBe('t1');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tracks/t1`);
    expect(req.request.method).toBe('GET');
    req.flush(detail);
  });

  it('should patch track status', () => {
    service.updateStatus('t1', 'Submitted').subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tracks/t1/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'Submitted' });
    req.flush({ ...detail, status: 'Submitted' });
  });

  it('should post distribute payload', () => {
    service.distribute('t1', ['d1', 'd2']).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tracks/t1/distribute`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ dspIds: ['d1', 'd2'] });
    req.flush(detail);
  });

  it('should request DSPs', () => {
    service.getDsps().subscribe((dsps) => {
      expect(dsps.length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/dsps`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 'd1', name: 'Spotify' }]);
  });
});
