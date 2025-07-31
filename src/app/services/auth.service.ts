import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthResponse, LoginRequest, RegisterRequest, Vendor } from '../models';
import { environment } from '../../environments/environment';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private currentVendorSubject = new BehaviorSubject<Vendor | null>(null);
  public currentVendor$ = this.currentVendorSubject.asObservable();
  
  private readonly TOKEN_COOKIE_NAME = 'inLine_auth_token';
  private readonly VENDOR_COOKIE_NAME = 'inLine_vendor_data';
  private readonly COOKIE_DAYS = 7; // Token expires in 7 days

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    // Check for existing token on service initialization
    const token = this.cookieService.getCookie(this.TOKEN_COOKIE_NAME);
    const vendorData = this.cookieService.getCookie(this.VENDOR_COOKIE_NAME);
    if (token && vendorData) {
      try {
        this.currentVendorSubject.next(JSON.parse(vendorData));
      } catch (error) {
        console.error('Error parsing vendor data from cookie:', error);
        this.clearAuthData();
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.storeAuthData(response.token, response.vendor);
        })
      );
  }

  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, registerData)
      .pipe(
        tap(response => {
          this.storeAuthData(response.token, response.vendor);
        })
      );
  }

  logout(): void {
    this.clearAuthData();
  }

  getToken(): string | null {
    return this.cookieService.getCookie(this.TOKEN_COOKIE_NAME);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  getCurrentVendor(): Vendor | null {
    return this.currentVendorSubject.value;
  }

  private storeAuthData(token: string, vendor: Vendor): void {
    const isProduction = environment.production;
    
    // Store token in secure cookie
    this.cookieService.setCookie(
      this.TOKEN_COOKIE_NAME, 
      token, 
      this.COOKIE_DAYS, 
      isProduction, // Secure flag - only for HTTPS in production
      'Lax'
    );
    
    // Store vendor data in cookie (less sensitive)
    this.cookieService.setCookie(
      this.VENDOR_COOKIE_NAME, 
      JSON.stringify(vendor), 
      this.COOKIE_DAYS, 
      false, // Not secure since it's not sensitive data
      'Lax'
    );
    
    this.currentVendorSubject.next(vendor);
  }

  private clearAuthData(): void {
    this.cookieService.deleteCookie(this.TOKEN_COOKIE_NAME);
    this.cookieService.deleteCookie(this.VENDOR_COOKIE_NAME);
    this.currentVendorSubject.next(null);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
