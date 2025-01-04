import { NG_EVENT_PLUGINS } from '@taiga-ui/event-plugins';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { env } from '../env/firebase';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { AngularYandexMapsModule, YaConfig } from 'angular8-yandex-maps';


const config: YaConfig = {
  apikey: '5c6cbf77-5d8b-4182-aab6-95b91ea89bdc',
};

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(AngularYandexMapsModule.forRoot(config)),
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(env)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    NG_EVENT_PLUGINS,
  ],
};
