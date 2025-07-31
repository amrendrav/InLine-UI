import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer, CustomerJoinRequest, CustomerSearchRequest, WaitlistMetrics } from '../models';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WaitlistService {
  private readonly API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Customer methods
  joinWaitlist(customerData: CustomerJoinRequest): Observable<Customer> {
    return this.http.post<Customer>(`${this.API_URL}/waitlist/join`, customerData);
  }

  searchCustomer(searchData: CustomerSearchRequest): Observable<Customer | null> {
    return this.http.post<Customer | null>(`${this.API_URL}/waitlist/search`, searchData);
  }

  getWaitlist(vendorId: number): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.API_URL}/waitlist/${vendorId}`);
  }

  getWaitlistForVendor(vendorId: number): Observable<Customer[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<Customer[]>(`${this.API_URL}/waitlist/${vendorId}`, { headers });
  }

  updateCustomerStatus(customerId: number, status: string): Observable<Customer> {
    const headers = this.authService.getAuthHeaders();
    return this.http.patch<Customer>(`${this.API_URL}/waitlist/customer/${customerId}`, 
      { status }, { headers });
  }

  removeFromWaitlist(customerId: number): Observable<void> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<void>(`${this.API_URL}/waitlist/customer/${customerId}`, { headers });
  }

  getWaitlistMetrics(vendorId: number): Observable<WaitlistMetrics> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<WaitlistMetrics>(`${this.API_URL}/waitlist/${vendorId}/metrics`, { headers });
  }

  notifyCustomer(customerId: number): Observable<void> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<void>(`${this.API_URL}/waitlist/customer/${customerId}/notify`, {}, { headers });
  }

  getEstimatedWaitTime(vendorId: number, position: number): Observable<{ estimatedMinutes: number }> {
    return this.http.get<{ estimatedMinutes: number }>(`${this.API_URL}/waitlist/${vendorId}/estimate/${position}`);
  }
}
