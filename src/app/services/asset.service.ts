import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asset, AssetCreateRequest, AssetUpdateRequest } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all assets for a vendor
  getAssets(vendorId: number): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${this.apiUrl}/assets/vendor/${vendorId}`);
  }

  // Get a specific asset
  getAsset(assetId: number): Observable<Asset> {
    return this.http.get<Asset>(`${this.apiUrl}/assets/${assetId}`);
  }

  // Create a new asset
  createAsset(asset: AssetCreateRequest): Observable<Asset> {
    return this.http.post<Asset>(`${this.apiUrl}/assets`, asset);
  }

  // Update an asset
  updateAsset(assetId: number, asset: AssetUpdateRequest): Observable<Asset> {
    return this.http.put<Asset>(`${this.apiUrl}/assets/${assetId}`, asset);
  }

  // Delete an asset
  deleteAsset(assetId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/assets/${assetId}`);
  }

  // Get asset capacity summary
  getAssetCapacitySummary(vendorId: number): Observable<{
    totalCapacity: number;
    availableCapacity: number;
    occupiedCapacity: number;
    maintenanceCapacity: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/assets/vendor/${vendorId}/capacity-summary`);
  }
}
