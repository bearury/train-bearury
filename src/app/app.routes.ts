import { Routes } from '@angular/router';
import { AuthPageComponent } from '@pages/auth-page/auth-page.component';
import { StationsPageComponent } from '@pages/stations-page/stations-page.component';
import { StationManagerPageComponent } from '@pages/station-manager-page/station-manager-page.component';
import { CarriagesManagerPageComponent } from '@pages/carriages-manager-page/carriages-manager-page.component';
import { CarriagesPageComponent } from '@pages/carriages-page/carriages-page.component';

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
    path: 'admin',
    children: [
      {
        path: 'stations',
        component: StationsPageComponent,
      },
      {
        path: 'station',
        children: [
          {
            path: ':stationId',
            component: StationManagerPageComponent,
          },
          {
            path: '',
            component: StationManagerPageComponent,
          },
        ],
      },
      {
        path: 'carriages',
        component: CarriagesPageComponent,
      },
      {
        path: 'carriage',
        children: [
          {
            path: 'update/:carriageId',
            component: CarriagesManagerPageComponent,
          },
          {
            path: 'create',
            component: CarriagesManagerPageComponent,
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'admin/stations',
  },
];
