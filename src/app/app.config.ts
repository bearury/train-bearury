import { NG_EVENT_PLUGINS } from '@taiga-ui/event-plugins';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';

import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { AngularYandexMapsModule } from 'angular8-yandex-maps';
import { env, yaConfig } from '@env';


export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(AngularYandexMapsModule.forRoot(yaConfig)),
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(env)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    NG_EVENT_PLUGINS,
  ],
};
