import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor() {}

  /**
   * Intercept HTTP requests and add JWT token from localStorage to Authorization header
   * This applies to /cart and /orders requests
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only add token to API requests (not to external URLs)
    const isApiRequest = request.url.includes('/api/');
    
    if (isApiRequest) {
      const token = localStorage.getItem('authToken');
      
      // Only add the Authorization header if a token exists
      if (token) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    }

    return next.handle(request);
  }
}
