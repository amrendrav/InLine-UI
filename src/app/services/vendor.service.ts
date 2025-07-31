import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vendor } from '../models';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private readonly API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get a vendor by their ID
   * @param vendorId - The ID of the vendor to retrieve
   * @returns Observable<Vendor> - The vendor data
   */
  getVendorById(vendorId: number): Observable<Vendor> {
    return this.http.get<Vendor>(`${this.API_URL}/vendors/${vendorId}`);
  }

}
