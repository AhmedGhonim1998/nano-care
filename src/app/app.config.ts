import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor'; // تأكد إن ده الـ Functional

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    // الطريقة الصح هنا
    provideHttpClient(
      withInterceptors([authInterceptor]) 
    )
  ]
};