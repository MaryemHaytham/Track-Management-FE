import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Dsp, TrackDetail } from '../../models/track.models';
import { TrackService } from '../../services/track.service';
import { TrackDetailComponent } from './track-detail.component';

describe('TrackDetailComponent', () => {
  let fixture: ComponentFixture<TrackDetailComponent>;
  let component: TrackDetailComponent;
  let trackService: jasmine.SpyObj<TrackService>;

  const track: TrackDetail = {
    id: 't1',
    title: 'Midnight Drive',
    artistId: 'a1',
    artistName: 'Nova',
    isrc: 'USRC17607839',
    releaseDate: '2024-01-01',
    genre: 'Pop',
    status: 'Draft',
    distributions: [
      {
        id: 'dist1',
        dspId: 'd1',
        dspName: 'Spotify',
        submittedAt: '2024-01-02',
        status: 'Pending'
      }
    ]
  };

  const dsps: Dsp[] = [
    { id: 'd1', name: 'Spotify' },
    { id: 'd2', name: 'Apple Music' }
  ];

  beforeEach(async () => {
    trackService = jasmine.createSpyObj<TrackService>('TrackService', [
      'getTrackById',
      'getDsps',
      'updateStatus',
      'distribute'
    ]);
    trackService.getTrackById.and.returnValue(of(track));
    trackService.getDsps.and.returnValue(of(dsps));

    await TestBed.configureTestingModule({
      imports: [TrackDetailComponent],
      providers: [
        provideRouter([]),
        { provide: TrackService, useValue: trackService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? 't1' : null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TrackDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create and load track detail plus DSPs', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(trackService.getTrackById).toHaveBeenCalledWith('t1');
    expect(trackService.getDsps).toHaveBeenCalled();
    expect(component.track?.title).toBe('Midnight Drive');
    expect(component.dsps.length).toBe(2);
    expect(component.selectedStatus).toBe('Draft');
    expect(component.loading).toBeFalse();
  });

  it('should mark existing DSP distributions', () => {
    fixture.detectChanges();

    expect(component.isAlreadyDistributed('d1')).toBeTrue();
    expect(component.isAlreadyDistributed('d2')).toBeFalse();
  });

  it('should toggle DSP selection', () => {
    fixture.detectChanges();

    component.toggleDsp('d2', true);
    expect(component.isDspSelected('d2')).toBeTrue();

    component.toggleDsp('d2', false);
    expect(component.isDspSelected('d2')).toBeFalse();
  });

  it('should update status through the track service', () => {
    fixture.detectChanges();
    trackService.updateStatus.and.returnValue(of({ ...track, status: 'Submitted' }));

    component.selectedStatus = 'Submitted';
    component.updateStatus();

    expect(trackService.updateStatus).toHaveBeenCalledWith('t1', 'Submitted');
    expect(component.track?.status).toBe('Submitted');
    expect(component.actionMessage).toContain('Submitted');
    expect(component.actionLoading).toBeFalse();
  });

  it('should distribute selected DSPs', () => {
    fixture.detectChanges();
    trackService.distribute.and.returnValue(
      of({
        ...track,
        status: 'Submitted',
        distributions: [
          ...track.distributions,
          {
            id: 'dist2',
            dspId: 'd2',
            dspName: 'Apple Music',
            submittedAt: '2024-01-03',
            status: 'Pending'
          }
        ]
      })
    );

    component.toggleDsp('d2', true);
    component.distribute();

    expect(trackService.distribute).toHaveBeenCalledWith('t1', ['d2']);
    expect(component.actionMessage).toContain('submitted to selected DSPs');
    expect(component.isDspSelected('d2')).toBeFalse();
    expect(component.actionLoading).toBeFalse();
  });

  it('should show an error when track loading fails', () => {
    trackService.getTrackById.and.returnValue(throwError(() => new Error('missing')));

    fixture.detectChanges();

    expect(component.error).toContain('Track not found');
    expect(component.loading).toBeFalse();
  });
});
