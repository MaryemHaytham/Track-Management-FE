export type TrackStatus = 'Draft' | 'Submitted' | 'Distributed';
export type DistributionStatus = 'Pending' | 'Live' | 'Rejected';

export interface TrackListItem {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  isrc: string;
  releaseDate: string;
  genre: string;
  status: TrackStatus;
}

export interface Distribution {
  id: string;
  dspId: string;
  dspName: string;
  submittedAt: string;
  status: DistributionStatus;
}

export interface TrackDetail extends TrackListItem {
  distributions: Distribution[];
}

export interface Dsp {
  id: string;
  name: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAtUtc: string;
  username: string;
}
