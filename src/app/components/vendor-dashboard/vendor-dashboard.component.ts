import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../services/auth.service';
import { WaitlistService } from '../../services/waitlist.service';
import { AssetService } from '../../services/asset.service';
import { Customer, WaitlistMetrics, Vendor, Asset, AssetCreateRequest } from '../../models';
import { QRCodeDialogComponent } from '../qr-code-dialog/qr-code-dialog.component';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  template: `
    <div class="container" *ngIf="currentVendor">
      <div class="header">
        <h1>{{ currentVendor.businessName }} Dashboard</h1>
        <div class="header-actions">
          <button mat-raised-button color="accent" (click)="copyWaitlistLink()">
            <mat-icon>qr_code</mat-icon>
            Show QR Code
          </button>
          <button mat-button [matMenuTriggerFor]="menu">
            <mat-icon>account_circle</mat-icon>
            {{ currentVendor.contactName }}
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              Logout
            </button>
          </mat-menu>
        </div>
      </div>

      <mat-tab-group>
        <mat-tab label="Dashboard">
          <div class="dashboard-content">
            <!-- Metrics Cards -->
            <div class="metrics-grid">
              <mat-card class="metric-card">
                <mat-card-content>
                  <div class="metric-value">{{ metrics?.totalCustomers || 0 }}</div>
                  <div class="metric-label">Parties in Queue</div>
                </mat-card-content>
              </mat-card>

              <mat-card class="metric-card">
                <mat-card-content>
                  <div class="metric-value">{{ getTotalPeopleCount() }}</div>
                  <div class="metric-label">Total People</div>
                  <div class="metric-icon">
                    <mat-icon>group</mat-icon>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="metric-card">
                <mat-card-content>
                  <div class="metric-value">{{ metrics?.averageWaitTime || 0 }}min</div>
                  <div class="metric-label">Average Wait Time</div>
                </mat-card-content>
              </mat-card>

              <mat-card class="metric-card">
                <mat-card-content>
                  <div class="metric-value">{{ getLargestPartySize() }}</div>
                  <div class="metric-label">Largest Party</div>
                  <div class="metric-icon">
                    <mat-icon>people</mat-icon>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="metric-card">
                <mat-card-content>
                  <div class="metric-value">{{ metrics?.customersServedToday || 0 }}</div>
                  <div class="metric-label">Served Today</div>
                </mat-card-content>
              </mat-card>

              <mat-card class="metric-card">
                <mat-card-content>
                  <div class="metric-value">{{ metrics?.currentWaitTime || 0 }}min</div>
                  <div class="metric-label">Current Wait Time</div>
                </mat-card-content>
              </mat-card>

              <!-- Dynamic Preference Cards -->
              <mat-card class="metric-card preference-card" 
                        *ngFor="let preference of getDistinctPreferences()" 
                        [ngClass]="'preference-' + preference.name.toLowerCase()">
                <mat-card-content>
                  <div class="metric-value">{{ preference.count }}</div>
                  <div class="metric-label">{{ preference.name | titlecase }}</div>
                  <div class="metric-icon">
                    <mat-icon>{{ getPreferenceIcon(preference.name) }}</mat-icon>
                  </div>
                </mat-card-content>
              </mat-card>

            </div>

            <!-- Current Waitlist -->
            <mat-card class="waitlist-card">
              <mat-card-header>
                <mat-card-title>Current Waitlist</mat-card-title>
                <mat-card-subtitle>{{ customers.length }} customers waiting</mat-card-subtitle>
                <button mat-button (click)="refreshWaitlist()">
                  <mat-icon>refresh</mat-icon>
                  Refresh
                </button>
              </mat-card-header>
              
              <mat-card-content>
                <div class="waitlist-table">
                  <table mat-table [dataSource]="customers" class="full-width-table">
                    <ng-container matColumnDef="position">
                      <th mat-header-cell *matHeaderCellDef>Position</th>
                      <td mat-cell *matCellDef="let customer">
                        <div class="position-badge">{{ customer.position }}</div>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>Customer</th>
                      <td mat-cell *matCellDef="let customer">
                        <div class="customer-info">
                          <div class="customer-name">{{ customer.firstName }} {{ customer.lastName || '' }}</div>
                          <div class="customer-contact">
                            <span *ngIf="customer.phone">{{ customer.phone }}</span>
                            <span *ngIf="customer.email">{{ customer.email }}</span>
                          </div>
                        </div>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="partySize">
                      <th mat-header-cell *matHeaderCellDef>Party Size</th>
                      <td mat-cell *matCellDef="let customer">
                        <div class="party-size-cell">
                          <div class="party-indicator">
                            <mat-icon class="party-icon">{{ customer.partySize === 1 ? 'person' : 'group' }}</mat-icon>
                            <span class="party-count">{{ customer.partySize }}</span>
                          </div>
                        </div>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="preference">
                      <th mat-header-cell *matHeaderCellDef>Preference</th>
                      <td mat-cell *matCellDef="let customer">
                        <div class="preference-cell">
                          <span class="preference-text">{{ customer.preference || '-' }}</span>
                        </div>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="waitTime">
                      <th mat-header-cell *matHeaderCellDef>Wait Time</th>
                      <td mat-cell *matCellDef="let customer">
                        <div class="wait-time" [title]="getJoinedDateTooltip(customer)">{{ getWaitingTime(customer) }}</div>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let customer">
                        <mat-chip-set>
                          <mat-chip [color]="getStatusColor(customer.status)" selected>
                            {{ customer.status | titlecase }}
                          </mat-chip>
                        </mat-chip-set>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let customer">
                        <button mat-icon-button [matMenuTriggerFor]="actionMenu">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                        <mat-menu #actionMenu="matMenu">
                          <button mat-menu-item (click)="notifyCustomer(customer)">
                            <mat-icon>notifications</mat-icon>
                            Notify Customer
                          </button>
                          <button mat-menu-item (click)="serveCustomer(customer)">
                            <mat-icon>check_circle</mat-icon>
                            Mark as Served
                          </button>
                          <button mat-menu-item (click)="removeCustomer(customer)">
                            <mat-icon>remove_circle</mat-icon>
                            Remove from Queue
                          </button>
                        </mat-menu>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                  </table>

                  <div class="no-data" *ngIf="customers.length === 0">
                    <mat-icon>people_outline</mat-icon>
                    <p>No customers in waitlist</p>
                    <p>Share your waitlist link to start receiving customers</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Analytics">
          <div class="analytics-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Analytics Dashboard</mat-card-title>
                <mat-card-subtitle>Coming Soon</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p>Advanced analytics features including:</p>
                <ul>
                  <li>Peak hours analysis</li>
                  <li>Customer flow charts</li>
                  <li>Wait time trends</li>
                  <li>Monthly reports</li>
                </ul>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Assets">
          <div class="assets-content">
            <!-- Asset Summary Cards -->
            <div class="asset-metrics-grid">
              <mat-card class="metric-card">
                <mat-card-content>
                  <div class="metric-value">{{ assets.length }}</div>
                  <div class="metric-label">Total Assets</div>
                  <div class="metric-icon">
                    <mat-icon>business</mat-icon>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="metric-card">
                <mat-card-content>
                  <div class="metric-value">{{ getTotalCapacity() }}</div>
                  <div class="metric-label">Total Capacity</div>
                  <div class="metric-icon">
                    <mat-icon>groups</mat-icon>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="metric-card">
                <mat-card-content>
                  <div class="metric-value">{{ getAvailableAssets() }}</div>
                  <div class="metric-label">Available Assets</div>
                  <div class="metric-icon">
                    <mat-icon>check_circle</mat-icon>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="metric-card">
                <mat-card-content>
                  <div class="metric-value">{{ getOccupiedAssets() }}</div>
                  <div class="metric-label">Occupied Assets</div>
                  <div class="metric-icon">
                    <mat-icon>people</mat-icon>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Asset Management -->
            <mat-card class="assets-card">
              <mat-card-header>
                <mat-card-title>Asset Management</mat-card-title>
                <mat-card-subtitle>Manage your tables, rooms, and other assets</mat-card-subtitle>
                <button mat-raised-button color="primary" (click)="openAssetForm()">
                  <mat-icon>add</mat-icon>
                  Add Asset
                </button>
              </mat-card-header>
              
              <mat-card-content>
                <!-- Add/Edit Asset Form -->
                <div class="add-asset-form" *ngIf="showAssetForm">
                  <h3>{{ editingAsset ? 'Edit Asset' : 'Add New Asset' }}</h3>
                  <form [formGroup]="assetForm" (ngSubmit)="createAsset()" class="asset-form">
                    <!-- Category field first and mandatory -->
                    <div class="form-row single-column">
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Category *</mat-label>
                        <mat-select formControlName="category">
                        <mat-option value="indoor">Indoor</mat-option>
                        <mat-option value="outdoor">Outdoor</mat-option>
                          <mat-option value="dining">Dining</mat-option>
                          <mat-option value="vip">VIP</mat-option>
                          <mat-option value="standard">Standard</mat-option>
                          <mat-option value="premium">Premium</mat-option>
                          <mat-option value="family">Family</mat-option>
                          <mat-option value="business">Business</mat-option>
                        </mat-select>
                        <mat-error *ngIf="assetForm.get('category')?.hasError('required')">
                          Category is required
                        </mat-error>
                      </mat-form-field>
                    </div>

                    <!-- Apply to all assets in category checkbox (only show when editing existing asset) -->
                    <div class="form-row single-column" *ngIf="editingAsset">
                      <mat-checkbox formControlName="applyToAll" class="apply-to-all-checkbox">
                        Apply these settings to all assets in this category
                      </mat-checkbox>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Asset Name</mat-label>
                        <input matInput formControlName="name" placeholder="e.g., Table 1, VIP Room">
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Capacity</mat-label>
                        <input matInput type="number" formControlName="capacity" placeholder="Number of people" min="1">
                        <mat-error *ngIf="assetForm.get('capacity')?.hasError('min')">
                          Capacity must be at least 1
                        </mat-error>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Type</mat-label>
                        <mat-select formControlName="type">
                          <mat-option value="table">Table</mat-option>
                          <mat-option value="room">Room</mat-option>
                          <mat-option value="booth">Booth</mat-option>
                          <mat-option value="counter">Counter</mat-option>
                          <mat-option value="other">Other</mat-option>
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Status</mat-label>
                        <mat-select formControlName="status">
                          <mat-option value="available">Available</mat-option>
                          <mat-option value="occupied">Occupied</mat-option>
                          <mat-option value="maintenance">Maintenance</mat-option>
                          <mat-option value="reserved">Reserved</mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>

                    <mat-form-field appearance="outline" class="form-field full-width">
                      <mat-label>Description</mat-label>
                      <textarea matInput formControlName="description" rows="3" 
                                placeholder="Additional details about this asset"></textarea>
                    </mat-form-field>

                    <div class="form-actions">
                      <button mat-button type="button" (click)="cancelAssetForm()">Cancel</button>
                      <button mat-raised-button color="primary" type="submit" 
                              [disabled]="!assetForm.valid || isCreatingAsset">
                        <mat-icon *ngIf="isCreatingAsset">hourglass_empty</mat-icon>
                        {{ isCreatingAsset ? (editingAsset ? 'Updating...' : 'Creating...') : (editingAsset ? 'Update Asset' : 'Create Asset') }}
                      </button>
                    </div>
                  </form>
                </div>

                <!-- Assets Table -->
                <div class="assets-table">
                  <table mat-table [dataSource]="assets" class="full-width-table">
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>Name</th>
                      <td mat-cell *matCellDef="let asset">
                        <div class="asset-name">
                          <strong>{{ asset.name }}</strong>
                          <div class="asset-type" *ngIf="asset.type">{{ asset.type | titlecase }}</div>
                        </div>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="capacity">
                      <th mat-header-cell *matHeaderCellDef>Capacity</th>
                      <td mat-cell *matCellDef="let asset">
                        <div class="capacity-info">
                          <mat-icon>groups</mat-icon>
                          <span>{{ asset.capacity }}</span>
                        </div>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="category">
                      <th mat-header-cell *matHeaderCellDef>Category</th>
                      <td mat-cell *matCellDef="let asset">
                        <mat-chip-set *ngIf="asset.category">
                          <mat-chip>{{ asset.category | titlecase }}</mat-chip>
                        </mat-chip-set>
                        <span *ngIf="!asset.category">-</span>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let asset">
                        <mat-chip-set>
                          <mat-chip [color]="getAssetStatusColor(asset.status)" selected>
                            {{ asset.status | titlecase }}
                          </mat-chip>
                        </mat-chip-set>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="description">
                      <th mat-header-cell *matHeaderCellDef>Description</th>
                      <td mat-cell *matCellDef="let asset">
                        <span class="description-text">{{ asset.description || '-' }}</span>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let asset">
                        <button mat-icon-button [matMenuTriggerFor]="assetActionMenu">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                        <mat-menu #assetActionMenu="matMenu">
                          <button mat-menu-item (click)="editAsset(asset)">
                            <mat-icon>edit</mat-icon>
                            Edit Asset
                          </button>
                          <button mat-menu-item (click)="updateAssetStatus(asset, 'available')" 
                                  *ngIf="asset.status !== 'available'">
                            <mat-icon>check_circle</mat-icon>
                            Mark Available
                          </button>
                          <button mat-menu-item (click)="updateAssetStatus(asset, 'occupied')" 
                                  *ngIf="asset.status !== 'occupied'">
                            <mat-icon>people</mat-icon>
                            Mark Occupied
                          </button>
                          <button mat-menu-item (click)="updateAssetStatus(asset, 'maintenance')" 
                                  *ngIf="asset.status !== 'maintenance'">
                            <mat-icon>build</mat-icon>
                            Mark Maintenance
                          </button>
                          <button mat-menu-item (click)="deleteAsset(asset)" class="delete-action">
                            <mat-icon>delete</mat-icon>
                            Delete Asset
                          </button>
                        </mat-menu>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="assetDisplayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: assetDisplayedColumns;"></tr>
                  </table>

                  <div class="no-data" *ngIf="assets.length === 0">
                    <mat-icon>business</mat-icon>
                    <p>No assets configured</p>
                    <p>Add your first asset to start managing capacity</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Subscription">
          <div class="subscription-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Subscription Management</mat-card-title>
                <mat-card-subtitle>{{ currentVendor.subscriptionPlan | titlecase }} Plan</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="subscription-status">
                  <mat-chip-set>
                    <mat-chip [color]="currentVendor.subscriptionStatus === 'active' ? 'primary' : 'warn'" selected>
                      {{ currentVendor.subscriptionStatus | titlecase }}
                    </mat-chip>
                  </mat-chip-set>
                </div>
                
                <div class="subscription-actions">
                  <button mat-raised-button color="primary">Upgrade Plan</button>
                  <button mat-button>Update Payment Method</button>
                  <button mat-button>Download Invoices</button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styleUrls: ['./vendor-dashboard.component.scss']
})
export class VendorDashboardComponent implements OnInit, OnDestroy {
  currentVendor: Vendor | null = null;
  customers: Customer[] = [];
  assets: Asset[] = [];
  metrics: WaitlistMetrics | null = null;
  displayedColumns: string[] = ['position', 'name', 'partySize', 'preference', 'waitTime', 'status', 'actions'];
  assetDisplayedColumns: string[] = ['category', 'name', 'capacity', 'status', 'description', 'actions'];
  
  // Asset form management
  showAssetForm = false;
  assetForm: FormGroup;
  isCreatingAsset = false;
  editingAsset: Asset | null = null;
  
  // Timer for updating wait times
  private waitTimeUpdateInterval: any;

  constructor(
    private authService: AuthService,
    private waitlistService: WaitlistService,
    private assetService: AssetService,
    private router: Router,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.assetForm = this.fb.group({
      category: ['', Validators.required], // Category is now mandatory and first
      applyToAll: [false], // New checkbox field for applying to all assets in category
      name: [''], // No longer required
      capacity: [1, Validators.min(1)], // No longer required, but still has min validation
      type: [''],
      description: [''],
      status: ['available', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentVendor = this.authService.getCurrentVendor();
    if (!this.currentVendor) {
      this.router.navigate(['/vendor/login']);
      return;
    }

    this.loadDashboardData();
    
    // Update wait times every minute
    this.waitTimeUpdateInterval = setInterval(() => {
      // Trigger change detection to update the displayed wait times
      this.cdr.detectChanges();
    }, 60000); // 60 seconds
  }

  ngOnDestroy(): void {
    if (this.waitTimeUpdateInterval) {
      clearInterval(this.waitTimeUpdateInterval);
    }
  }

  loadDashboardData(): void {
    if (!this.currentVendor?.id) return;

    this.waitlistService.getWaitlistForVendor(this.currentVendor.id).subscribe({
      next: (customers) => {
        this.customers = customers;
      },
      error: (error) => {
        console.error('Error loading waitlist:', error);
      }
    });

    this.waitlistService.getWaitlistMetrics(this.currentVendor.id).subscribe({
      next: (metrics) => {
        this.metrics = metrics;
      },
      error: (error) => {
        console.error('Error loading metrics:', error);
      }
    });

    this.loadAssets();
  }

  loadAssets(): void {
    if (!this.currentVendor?.id) return;

    this.assetService.getAssets(this.currentVendor.id).subscribe({
      next: (assets) => {
        this.assets = assets;
      },
      error: (error) => {
        console.error('Error loading assets:', error);
      }
    });
  }

  refreshWaitlist(): void {
    this.loadDashboardData();
    this.snackBar.open('Waitlist refreshed', 'Close', { duration: 2000 });
  }

  copyWaitlistLink(): void {
    const link = `${window.location.origin}/customer/${this.currentVendor?.id}`;
    
    const dialogRef = this.dialog.open(QRCodeDialogComponent, {
      width: '550px',
      maxWidth: '95vw',
      minWidth: '320px',
      maxHeight: '95vh',
      data: {
        url: link,
        businessName: this.currentVendor?.businessName || 'Business'
      },
      panelClass: 'qr-dialog-panel',
      disableClose: false,
      hasBackdrop: true,
      backdropClass: 'qr-dialog-backdrop',
      autoFocus: false,
      restoreFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      // Optional: Handle any actions after dialog closes
    });
  }

  getTotalPeopleCount(): number {
    return this.customers.reduce((total, customer) => {
      return total + (customer.partySize || 1);
    }, 0);
  }

  getLargestPartySize(): number {
    if (this.customers.length === 0) return 0;
    return Math.max(...this.customers.map(customer => customer.partySize || 1));
  }

  getDistinctPreferences(): { name: string, count: number }[] {
    // Filter customers with non-null preferences
    const customersWithPreferences = this.customers.filter(customer => 
      customer.preference && customer.preference.trim() !== ''
    );

    // Count occurrences of each preference
    const preferenceCounts = customersWithPreferences.reduce((acc, customer) => {
      const preference = customer.preference!.toLowerCase().trim();
      acc[preference] = (acc[preference] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array of objects and sort by count (descending)
    return Object.entries(preferenceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  getPreferenceIcon(preference: string): string {
    const pref = preference.toLowerCase();
    switch (pref) {
      case 'outdoor':
        return 'wb_sunny';
      case 'indoor':
        return 'home';
      default:
        return 'place';
    }
  }

  getWaitingTime(customer: Customer): string {
    if (!customer.joinedAt) return '0 min';
    
    const joinedTime = new Date(customer.joinedAt);
    const currentTime = new Date();
    const diffInMilliseconds = currentTime.getTime() - joinedTime.getTime();
    const totalMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    
    if (totalMinutes < 0) return '0 min';
    
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;
    
    if (days > 0) {
      if (hours > 0) {
        return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
      }
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    
    if (hours > 0) {
      if (minutes > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
      }
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    
    return `${minutes} min`;
  }

  getJoinedDateTooltip(customer: Customer): string {
    if (!customer.joinedAt) return 'No join time available';
    
    const joinedTime = new Date(customer.joinedAt);
    return `Joined: ${joinedTime.toLocaleString()}`;
  }

  notifyCustomer(customer: Customer): void {
    if (!customer.id) return;

    this.waitlistService.notifyCustomer(customer.id).subscribe({
      next: () => {
        this.snackBar.open(`${customer.firstName} has been notified`, 'Close', { duration: 3000 });
        this.loadDashboardData();
      },
      error: (error) => {
        this.snackBar.open('Failed to notify customer', 'Close', { duration: 3000 });
      }
    });
  }

  serveCustomer(customer: Customer): void {
    if (!customer.id) return;

    this.waitlistService.updateCustomerStatus(customer.id, 'served').subscribe({
      next: () => {
        this.snackBar.open(`${customer.firstName} marked as served`, 'Close', { duration: 3000 });
        this.loadDashboardData();
      },
      error: (error) => {
        this.snackBar.open('Failed to update customer status', 'Close', { duration: 3000 });
      }
    });
  }

  removeCustomer(customer: Customer): void {
    if (!customer.id) return;

    this.waitlistService.removeFromWaitlist(customer.id).subscribe({
      next: () => {
        this.snackBar.open(`${customer.firstName} removed from waitlist`, 'Close', { duration: 3000 });
        this.loadDashboardData();
      },
      error: (error) => {
        this.snackBar.open('Failed to remove customer', 'Close', { duration: 3000 });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'waiting': return 'primary';
      case 'notified': return 'accent';
      case 'served': return 'primary';
      default: return 'warn';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  // Asset Management Methods
  openAssetForm(): void {
    this.showAssetForm = true;
    this.editingAsset = null;
    this.assetForm.reset({
      category: '', // Required field
      applyToAll: false, // Default to false
      name: '', // Optional
      capacity: 1, // Optional, but has a default
      type: '',
      description: '',
      status: 'available'
    });
  }

  cancelAssetForm(): void {
    this.showAssetForm = false;
    this.editingAsset = null;
    this.assetForm.reset();
  }

  createAsset(): void {
    if (!this.assetForm.valid || !this.currentVendor?.id) return;

    this.isCreatingAsset = true;

    const formValue = this.assetForm.value;

    // If editing an existing asset
    if (this.editingAsset?.id) {
      this.updateAsset();
      return;
    }

    // Creating a new asset
    const assetData: AssetCreateRequest = {
      vendorId: this.currentVendor.id,
      category: formValue.category,
      name: formValue.name || '', // Send empty string if no name provided
      capacity: formValue.capacity,
      type: formValue.type,
      description: formValue.description,
      status: formValue.status
    };

    this.assetService.createAsset(assetData).subscribe({
      next: (asset) => {
        this.isCreatingAsset = false;
        this.showAssetForm = false;
        this.loadAssets();
        this.snackBar.open('Asset created successfully!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.isCreatingAsset = false;
        this.snackBar.open('Failed to create asset', 'Close', { duration: 3000 });
      }
    });
  }

  updateAsset(): void {
    if (!this.assetForm.valid || !this.editingAsset?.id) return;

    this.isCreatingAsset = true;

    const formValue = this.assetForm.value;
    const updateData = {
      name: formValue.name || '', // Send empty string if no name provided
      capacity: formValue.capacity,
      type: formValue.type,
      category: formValue.category,
      description: formValue.description,
      status: formValue.status,
      applyToAll: formValue.applyToAll
    };

    this.assetService.updateAsset(this.editingAsset.id, updateData).subscribe({
      next: (response: any) => {
        this.isCreatingAsset = false;
        this.showAssetForm = false;
        this.editingAsset = null;
        this.loadAssets();
        
        // Show different messages based on whether "apply to all" was used
        if (formValue.applyToAll && response.updatedCount > 1) {
          this.snackBar.open(`Updated ${response.updatedCount} assets in category "${formValue.category}"!`, 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('Asset updated successfully!', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        this.isCreatingAsset = false;
        this.snackBar.open('Failed to update asset', 'Close', { duration: 3000 });
      }
    });
  }

  editAsset(asset: Asset): void {
    this.editingAsset = asset;
    this.showAssetForm = true;
    this.assetForm.patchValue({
      category: asset.category || '',
      applyToAll: false, // Always false when editing
      name: asset.name,
      capacity: asset.capacity,
      type: asset.type || '',
      description: asset.description || '',
      status: asset.status
    });
  }

  updateAssetStatus(asset: Asset, newStatus: 'available' | 'occupied' | 'maintenance' | 'reserved'): void {
    if (!asset.id) return;

    this.assetService.updateAsset(asset.id, { status: newStatus }).subscribe({
      next: () => {
        this.loadAssets();
        this.snackBar.open(`Asset status updated to ${newStatus}`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Failed to update asset status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteAsset(asset: Asset): void {
    if (!asset.id) return;

    if (confirm(`Are you sure you want to delete "${asset.name}"? This action cannot be undone.`)) {
      this.assetService.deleteAsset(asset.id).subscribe({
        next: () => {
          this.loadAssets();
          this.snackBar.open('Asset deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open('Failed to delete asset', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getTotalCapacity(): number {
    return this.assets.reduce((total, asset) => total + asset.capacity, 0);
  }

  getAvailableAssets(): number {
    return this.assets.filter(asset => asset.status === 'available').length;
  }

  getOccupiedAssets(): number {
    return this.assets.filter(asset => asset.status === 'occupied').length;
  }

  getAssetStatusColor(status: string): string {
    switch (status) {
      case 'available': return 'primary';
      case 'occupied': return 'warn';
      case 'maintenance': return 'accent';
      case 'reserved': return 'primary';
      default: return '';
    }
  }
}
