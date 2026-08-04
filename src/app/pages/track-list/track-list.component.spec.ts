import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TrackListItem } from '../../models/track.models';
import { TrackService } from '../../services/track.service';
import { TrackListComponent } from './track-list.component';

describe('TrackListComponent', () => {
  let fixture: ComponentFixture<TrackListComponent>;
  let component: TrackListComponent;
  let trackService: jasmine.SpyObj<TrackService>;

  const tracks: TrackListItem[] = [
    {
      id: 't1',
      title: 'Midnight Drive',
      artistId: 'a1',
      artistName: 'Nova',
      isrc: 'USRC17607839',
      releaseDate: '2024-01-01',
      genre: 'Pop',
      status: 'Draft'
    },
    {
      id: 't2',
      title: 'City Lights',
      artistId: 'a2',
      artistName: 'Echo',
      isrc: 'USRC17607840',
      releaseDate: '2024-02-01',
      genre: 'Electronic',
      status: 'Submitted'
    },
    {
      id: 't3',
      title: 'Afterglow',
      artistId: 'a1',
      artistName: 'Nova',
      isrc: 'USRC17607841',
      releaseDate: '2024-03-01',
      genre: 'Pop',
      status: 'Distributed'
    }
  ];

  beforeEach(async () => {
    trackService = jasmine.createSpyObj<TrackService>('TrackService', ['getTracks']);
    trackService.getTracks.and.returnValue(of(tracks));

    await TestBed.configureTestingModule({
      imports: [TrackListComponent],
      providers: [provideRouter([]), { provide: TrackService, useValue: trackService }]
    }).compileComponents();

    fixture = TestBed.createComponent(TrackListComponent);
    component = fixture.componentInstance;
  });

  it('should create and load tracks on init', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(trackService.getTracks).toHaveBeenCalled();
    expect(component.tracks().length).toBe(3);
    expect(component.counts()).toEqual({
      total: 3,
      draft: 1,
      submitted: 1,
      distributed: 1
    });
    expect(component.loading).toBeFalse();
  });

  it('should filter tracks by selected status', () => {
    fixture.detectChanges();

    component.setStatus('Draft');

    expect(component.tracks().length).toBe(1);
    expect(component.tracks()[0].title).toBe('Midnight Drive');
  });

  it('should show an error when catalog loading fails', () => {
    trackService.getTracks.and.returnValue(throwError(() => new Error('offline')));

    fixture.detectChanges();

    expect(component.error).toContain('Could not load the catalog');
    expect(component.loading).toBeFalse();
  });
});
