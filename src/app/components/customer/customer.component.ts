import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxMaskDirective } from 'ngx-mask';
import { WaitlistService } from '../../services/waitlist.service';
import { VendorService } from '../../services/vendor.service';
import { AssetService } from '../../services/asset.service';
import { Customer, CustomerJoinRequest, CustomerSearchRequest, Vendor, Asset } from '../../models';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule,
    NgxMaskDirective
  ],
  template: `
    <div class="container">
      <!-- Vendor Information Card -->
      <mat-card class="vendor-card" *ngIf="currentVendor">
        <mat-card-header>
          <mat-icon mat-card-avatar>business</mat-icon>
          <mat-card-title>{{ currentVendor.businessName }}</mat-card-title>
        </mat-card-header>
      </mat-card>

      <!-- Loading State for Vendor -->
      <mat-card class="vendor-card" *ngIf="isLoadingVendor">
        <mat-card-content class="loading-content">
          <mat-spinner diameter="30"></mat-spinner>
          <p>Loading business information...</p>
        </mat-card-content>
      </mat-card>

      <!-- Customer Status Display (if found) -->
      <mat-card class="status-card" *ngIf="currentCustomer">
        <mat-card-header>
          <mat-card-title>
            Welcome, {{ currentCustomer.firstName }}!
            <span class="party-badge" *ngIf="currentCustomer.partySize > 1">
              <mat-icon>group</mat-icon>
              Party of {{ currentCustomer.partySize }}
            </span>
          </mat-card-title>
          <mat-card-subtitle>You're in the waitlist</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="status-info">
            <div class="position-display">
              <div class="position-circle">
                <span class="position-number">{{ currentCustomer.position }}</span>
              </div>
              <div class="position-text">
                <h2>Your Position</h2>
                <p>{{ getPositionText(currentCustomer.position) }}</p>
              </div>
            </div>

            <div class="wait-info">
              <div class="wait-time">
                <mat-icon>schedule</mat-icon>
                <div>
                  <h3>Estimated Wait Time</h3>
                  <p class="time-value">{{ currentCustomer.waitTime }} minutes</p>
                </div>
              </div>

              <div class="status-badge">
                <mat-icon>{{ getStatusIcon(currentCustomer.status) }}</mat-icon>
                <span>{{ currentCustomer.status | titlecase }}</span>
              </div>
            </div>

            <div class="notification-info" *ngIf="currentCustomer.position <= 3">
              <mat-icon>notifications_active</mat-icon>
              <p>You're next! We'll notify you when it's your turn.</p>
            </div>
          </div>

          <div class="actions">
            <button mat-raised-button color="accent" (click)="refreshStatus()">
              <mat-icon>refresh</mat-icon>
              Refresh Status
            </button>
            
            <button mat-button color="warn" (click)="leaveWaitlist()">
              <mat-icon>exit_to_app</mat-icon>
              Leave Waitlist
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Tab Navigation -->
      <mat-card class="tabs-card">
        <mat-tab-group [(selectedIndex)]="selectedTabIndex" class="custom-tabs">
          <!-- Tab 1: Current Waitlist -->
          <mat-tab label="Current Waitlist">
            <div class="tab-content">
              <div class="waitlist-container">
                <!-- Waitlist Overview -->
                <div class="waitlist-content" *ngIf="allCustomers.length > 0; else noCustomers">
                  <div class="waitlist-header">
                    <h3>{{ allCustomers.length }} parties in line</h3>
                    <button mat-icon-button (click)="loadWaitlist()" title="Refresh">
                      <mat-icon>refresh</mat-icon>
                    </button>
                  </div>
                  
                  <div class="waitlist-items">
                    <div class="waitlist-item" *ngFor="let customer of allCustomers; let i = index"
                         [class.current-customer]="currentCustomer && customer.id === currentCustomer.id">
                      <div class="position-badge">{{ customer.position }}</div>
                      
                      <!-- Customer Name Section -->
                      <div class="customer-name-section">
                        <div class="customer-name">
                          <span *ngIf="currentCustomer && customer.id === currentCustomer.id">
                            {{ customer.firstName }}{{ customer.phone ? ' (...' + customer.phone.slice(-3) + ')' : '' }} (You)
                          </span>
                          <span *ngIf="!currentCustomer || customer.id !== currentCustomer.id">
                            {{ customer.firstName }}{{ customer.phone ? ' (...' + customer.phone.slice(-3) + ')' : '' }}
                          </span>
                        </div>
                      </div>

                      <!-- Party Size Icon (Right) -->
                      <div class="party-size-center">
                        <mat-icon class="party-icon-large">
                          {{ customer.partySize === 1 ? 'person' : 'group' }}
                        </mat-icon>
                        <span class="party-count">{{ customer.partySize }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <ng-template #noCustomers>
                  <div class="empty-state">
                    <mat-icon>people_outline</mat-icon>
                    <h3>No one in line</h3>
                    <p>Be the first to join the waitlist!</p>
                  </div>
                </ng-template>

                <!-- Sticky Search Bar -->
                <div class="sticky-search">
                  <div class="search-container">
                    <form [formGroup]="searchForm" (ngSubmit)="searchCustomer()" class="search-form">
                      <div class="search-input-container">
                        <mat-icon class="search-icon">search</mat-icon>
                        <input 
                          matInput 
                          formControlName="identifier" 
                          placeholder="Enter phone or email to check position"
                          class="search-input">
                        <button 
                          mat-icon-button 
                          type="submit" 
                          [disabled]="!searchForm.valid || isSearching"
                          class="search-button">
                          <mat-spinner diameter="16" *ngIf="isSearching"></mat-spinner>
                          <mat-icon *ngIf="!isSearching">search</mat-icon>
                        </button>
                      </div>
                      <div class="search-error" *ngIf="searchForm.get('identifier')?.hasError('required') && searchForm.get('identifier')?.touched">
                        Phone number or email is required
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 2: Join Waitlist -->
          <mat-tab label="Join Waitlist">
            <div class="tab-content">
              <div class="join-container">
                <h3>Join the waitlist:</h3>
                <form [formGroup]="joinForm" (ngSubmit)="joinWaitlist()" class="join-form">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>First Name *</mat-label>
                      <input matInput formControlName="firstName" required>
                      <mat-error *ngIf="joinForm.get('firstName')?.hasError('required')">
                        First name is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Last Name (Optional)</mat-label>
                      <input matInput formControlName="lastName">
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Phone Number</mat-label>
                      <input matInput formControlName="phone" 
                             mask="(000) 000-0000"
                             placeholder="(555) 123-4567">
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Party Size</mat-label>
                      <input matInput type="number" formControlName="partySize" 
                             placeholder="1" min="1" max="20">
                      <mat-hint>Number of people</mat-hint>
                      <mat-error *ngIf="joinForm.get('partySize')?.hasError('required')">
                        Party size is required
                      </mat-error>
                      <mat-error *ngIf="joinForm.get('partySize')?.hasError('min')">
                        Party size must be at least 1
                      </mat-error>
                      <mat-error *ngIf="joinForm.get('partySize')?.hasError('max')">
                        Party size cannot exceed 20
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="form-field">
                    <mat-label>Preference (Optional)</mat-label>
                    <mat-select formControlName="preference">
                      <mat-option value="">No preference</mat-option>
                      <mat-option *ngFor="let category of availableCategories" [value]="category">
                        {{category | titlecase}}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="form-field">
                    <mat-label>Email (Optional)</mat-label>
                    <input matInput type="email" formControlName="email">
                    <mat-error *ngIf="joinForm.get('email')?.hasError('email')">
                      Please enter a valid email
                    </mat-error>
                  </mat-form-field>

                  <div class="contact-note">
                    <mat-icon>info</mat-icon>
                    <p>We'll notify you via SMS when it's almost your turn. Party size helps us estimate wait times more accurately.</p>
                  </div>

                  <div class="error-message" *ngIf="errorMessage">
                    {{ errorMessage }}
                  </div>

                  <button mat-raised-button color="primary" type="submit" 
                          [disabled]="!joinForm.valid || isJoining" class="join-button">
                    <mat-spinner diameter="20" *ngIf="isJoining"></mat-spinner>
                    {{ isJoining ? 'Joining...' : 'Join Waitlist' }}
                  </button>
                </form>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styleUrl: './customer.component.scss'
})
export class CustomerComponent implements OnInit {
  vendorId: number | null = null;
  currentVendor: Vendor | null = null;
  currentCustomer: Customer | null = null;
  allCustomers: Customer[] = [];
  selectedTabIndex = 0; // Tab index for tab navigation
  availableCategories: string[] = [];
  
  searchForm: FormGroup;
  joinForm: FormGroup;
  
  isSearching = false;
  isJoining = false;
  isLoadingVendor = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private waitlistService: WaitlistService,
    private vendorService: VendorService,
    private assetService: AssetService,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.fb.group({
      identifier: ['', Validators.required]
    });

    this.joinForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      phone: [''],
      email: ['', Validators.email],
      partySize: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
      preference: ['']
    });
  }

  ngOnInit(): void {
    this.vendorId = Number(this.route.snapshot.paramMap.get('vendorId'));
    if (!this.vendorId) {
      // If no vendor ID, show a form to enter vendor ID or redirect to home
      this.router.navigate(['/home']);
      return;
    }

    this.loadVendorInfo();
    this.loadWaitlist();
    this.loadAvailableCategories();
  }

  loadVendorInfo(): void {
    if (!this.vendorId) return;

    this.isLoadingVendor = true;
    this.vendorService.getVendorById(this.vendorId).subscribe({
      next: (vendor) => {
        this.isLoadingVendor = false;
        this.currentVendor = vendor;
      },
      error: (error) => {
        this.isLoadingVendor = false;
        console.error('Error loading vendor info:', error);
        this.snackBar.open('Business information could not be loaded', 'Close', { duration: 3000 });
        
        // If vendor doesn't exist, redirect to home
        if (error.status === 404) {
          this.router.navigate(['/home']);
        }
      }
    });
  }

  searchCustomer(): void {
    if (!this.searchForm.valid || !this.vendorId) return;

    this.isSearching = true;
    this.errorMessage = '';

    const searchData: CustomerSearchRequest = {
      identifier: this.searchForm.value.identifier,
      vendorId: this.vendorId
    };

    this.waitlistService.searchCustomer(searchData).subscribe({
      next: (customer) => {
        this.isSearching = false;
        if (customer) {
          this.currentCustomer = customer;
          this.snackBar.open('Found your position in line!', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('No record found. Please join the waitlist.', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        this.isSearching = false;
        this.errorMessage = 'Search failed. Please try again.';
      }
    });
  }

  joinWaitlist(): void {
    if (!this.joinForm.valid || !this.vendorId) return;

    // Validate that at least phone or email is provided
    const phone = this.joinForm.value.phone;
    const email = this.joinForm.value.email;
    
    if (!phone && !email) {
      this.errorMessage = 'Please provide either a phone number or email address.';
      return;
    }

    this.isJoining = true;
    this.errorMessage = '';

    const joinData: CustomerJoinRequest = {
      ...this.joinForm.value,
      vendorId: this.vendorId
    };

    this.waitlistService.joinWaitlist(joinData).subscribe({
      next: (customer) => {
        this.isJoining = false;
        this.currentCustomer = customer;
        this.selectedTabIndex = 0; // Switch to waitlist tab
        this.loadWaitlist();
        this.snackBar.open('Successfully joined the waitlist!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.isJoining = false;
        this.errorMessage = error.error?.message || 'Failed to join waitlist. Please try again.';
      }
    });
  }

  refreshStatus(): void {
    if (this.currentCustomer?.phone || this.currentCustomer?.email) {
      const identifier = this.currentCustomer.phone || this.currentCustomer.email || '';
      this.searchForm.patchValue({ identifier });
      this.searchCustomer();
    }
    this.loadWaitlist();
  }

  leaveWaitlist(): void {
    if (!this.currentCustomer?.id) return;

    this.waitlistService.removeFromWaitlist(this.currentCustomer.id).subscribe({
      next: () => {
        this.currentCustomer = null;
        this.loadWaitlist();
        this.snackBar.open('You have left the waitlist', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Failed to leave waitlist', 'Close', { duration: 3000 });
      }
    });
  }

  loadWaitlist(): void {
    if (!this.vendorId) return;

    this.waitlistService.getWaitlist(this.vendorId).subscribe({
      next: (customers) => {
        this.allCustomers = customers.filter(c => c.status === 'waiting');
      },
      error: (error) => {
        console.error('Error loading waitlist:', error);
      }
    });
  }

  loadAvailableCategories(): void {
    if (!this.vendorId) return;

    this.assetService.getAssets(this.vendorId).subscribe({
      next: (assets: Asset[]) => {
        // Extract unique categories from assets
        const categories = [...new Set(assets.map(asset => asset.category).filter(Boolean))];
        this.availableCategories = categories as string[];
      },
      error: (error) => {
        console.error('Error loading asset categories:', error);
        // Fallback to default categories if API fails
        this.availableCategories = ['dining', 'vip', 'standard', 'premium', 'family', 'business', 'indoor', 'outdoor'];
      }
    });
  }

  getPositionText(position: number): string {
    if (position === 1) return "You're next!";
    if (position <= 3) return "Almost your turn!";
    return `${position - 1} people ahead of you`;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'waiting': return 'schedule';
      case 'notified': return 'notifications_active';
      case 'served': return 'check_circle';
      default: return 'info';
    }
  }
}
