import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { TrackListComponent } from './pages/track-list/track-list.component';
import { TrackDetailComponent } from './pages/track-detail/track-detail.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', pathMatch: 'full', redirectTo: 'tracks' },
  { path: 'tracks', component: TrackListComponent, canActivate: [authGuard] },
  { path: 'tracks/:id', component: TrackDetailComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'tracks' }
];
