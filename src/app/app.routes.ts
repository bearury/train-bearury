import { Routes } from '@angular/router';
import { AuthPageComponent } from './pages/auth-page/auth-page.component';
import { StationsPageComponent } from './pages/stations-page/stations-page.component';

export const routes: Routes = [
  {
    path: 'signin',
    component: AuthPageComponent,
  },
  {
    path: 'signup',
    component: AuthPageComponent,
  },
  {
    path: 'admin/stations',
    component: StationsPageComponent,
  },
  {
    path: '**',
    redirectTo: 'admin/stations',
  },
];
