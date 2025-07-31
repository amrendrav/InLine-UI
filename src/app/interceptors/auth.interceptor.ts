import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only add auth header to our API requests
    if (req.url.startsWith(environment.apiUrl)) {
      const token = this.authService.getToken();
      
      if (token) {
        // Clone the request and add the authorization header and credentials
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true // Include cookies in the request
        });
        return next.handle(authReq);
      } else {
        // Even without token, include credentials for cookie handling
        const credentialsReq = req.clone({
          withCredentials: true
        });
        return next.handle(credentialsReq);
      }
    }
    
    // For non-API requests, proceed without modification
    return next.handle(req);
  }
}
