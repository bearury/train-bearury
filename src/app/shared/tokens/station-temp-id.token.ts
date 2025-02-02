import { InjectionToken } from '@angular/core';

// export const STATION_TEMP_ID =
//   new InjectionToken<string>('STATION_TEMP_ID');


export const STATION_TEMP_ID =
  new InjectionToken<string>('', {
    factory: (): string => 'STATION_TEMP_ID',
  });
