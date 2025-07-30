import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { WaitlistService } from '../../services/waitlist.service';
import { Customer, CustomerJoinRequest, CustomerSearchRequest } from '../../models';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  template: `
    <div class="container">
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
                    <h3>{{ allCustomers.length }} people in line</h3>
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
                            {{ customer.firstName }} (You)
                          </span>
                          <span *ngIf="!currentCustomer || customer.id !== currentCustomer.id">
                            {{ getAnonymizedName(customer.firstName) }}
                          </span>
                        </div>
                      </div>

                      <!-- Party Size Icon (Center) -->
                      <div class="party-size-center" *ngIf="customer.partySize > 1">
                        <mat-icon class="party-icon-large">group</mat-icon>
                        <span class="party-count">{{ customer.partySize }}</span>
                      </div>
                      <div class="party-size-placeholder" *ngIf="customer.partySize <= 1"></div>

                      <!-- Wait Time Section -->
                      <div class="wait-time-section">
                        <div class="wait-time-display">~{{ customer.waitTime }} min</div>
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
  styles: [`
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    .status-card, .tabs-card {
      margin: 20px 0;
    }

    .tabs-card {
      min-height: 550px;
    }

    .custom-tabs {
      height: 100%;
    }

    .tab-content {
      padding: 0px 10px;
      min-height: 400px;
    }

    /* Tab 1: Waitlist Styles */
    .waitlist-container {
      position: relative;
      min-height: 500px;
      display: flex;
      flex-direction: column;
    }

    .waitlist-content {
      flex: 1;
      padding-bottom: 75px; /* Reduced space for smaller search bar */
    }

    .waitlist-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }

    .waitlist-header h3 {
      margin: 0;
      color: #3f51b5;
    }

    .waitlist-items {
      max-height: 310px; /* Reduced from 300px to account for smaller search bar */
      overflow-y: auto;
    }

    .waitlist-item {
      display: grid;
      grid-template-columns: auto 1fr auto 1fr;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-bottom: 1px solid #eee;
      transition: background-color 0.2s;
      min-height: 60px;
    }

    .waitlist-item:hover {
      background-color: #f5f5f5;
    }

    .waitlist-item.current-customer {
      background-color: #e8f5e8;
      border-left: 4px solid #4caf50;
    }

    .position-badge {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #3f51b5;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      flex-shrink: 0;
    }

    .customer-name-section {
      display: flex;
      align-items: center;
      min-width: 0; /* Allow text to truncate */
    }

    .customer-name {
      font-weight: 500;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Centered Party Size Icon */
    .party-size-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      border: 2px solid #2196f3;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      position: relative;
      box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
    }

    .party-icon-large {
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
      color: #1976d2 !important;
      margin: 0 !important;
    }

    .party-count {
      font-size: 10px;
      font-weight: bold;
      color: #1976d2;
      margin-top: -2px;
      line-height: 1;
    }

    .party-size-placeholder {
      width: 48px;
      height: 48px;
      /* Empty placeholder to maintain grid alignment */
    }

    .wait-time-section {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    .wait-time-display {
      font-size: 12px;
      color: #666;
      margin: 0;
      text-align: right;
      font-weight: 500;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px 60px 20px; /* Added bottom padding to prevent overlap */
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #ccc;
    }

    .empty-state h3 {
      margin: 16px 0 8px 0;
    }

    .empty-state p {
      margin: 0;
    }

    /* Sticky Search Bar */
    .sticky-search {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      backdrop-filter: blur(10px);
      border-radius: 15px; /* Rounded all corners */
      box-shadow: 0 -2px 15px rgba(0,0,0,0.1);
      z-index: 10;
      margin: 8px; /* Add margin to prevent edge touching */
    }

    .search-container {
      padding: 12px 16px; /* Reduced from 20px */
    }

    .search-form {
      width: 100%;
    }

    .search-input-container {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px; /* Reduced from 25px */
      padding: 6px 12px; /* Reduced padding */
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .search-input-container:focus-within {
      background: rgba(255, 255, 255, 1);
      box-shadow: 0 3px 15px rgba(0,0,0,0.12);
      transform: translateY(-1px); /* Reduced movement */
    }

    .search-icon {
      color: #666;
      margin-right: 10px; /* Reduced from 12px */
      font-size: 18px; /* Reduced from 20px */
      width: 18px;
      height: 18px;
    }

    .search-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-size: 14px; /* Reduced from 16px */
      color: #333;
      padding: 8px 0; /* Reduced from 12px */
    }

    .search-input::placeholder {
      color: #999;
      font-style: italic;
      font-size: 14px;
    }

    .search-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
      border: none !important;
      width: 32px !important;
      height: 32px !important;
      border-radius: 50% !important;
      margin-left: 6px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 6px rgba(102, 126, 234, 0.25) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0 !important;
      min-width: 32px !important;
      min-height: 32px !important;
      line-height: 1 !important;
    }

    .search-button .mat-icon {
      margin: 0 !important;
      padding: 0 !important;
      width: 18px !important;
      height: 18px !important;
      font-size: 18px !important;
      line-height: 1 !important;
    }

    .search-button:hover:not(:disabled) {
      transform: scale(1.05) !important;
      box-shadow: 0 3px 12px rgba(102, 126, 234, 0.35) !important;
    }

    .search-button:disabled {
      background: #ccc !important;
      box-shadow: none !important;
      transform: none;
    }

    .search-error {
      color: #ff4444;
      font-size: 11px; /* Reduced from 12px */
      margin-top: 6px; /* Reduced from 8px */
      padding-left: 28px; /* Reduced from 32px */
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Tab 2: Join Styles */
    .join-container {
      max-width: 400px;
      margin: 0 auto;
    }

    .join-container h3 {
      text-align: center;
      margin-bottom: 24px;
      color: #3f51b5;
    }

    .join-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-field {
      width: 100%;
      margin: 0;
    }

    .contact-note {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      background-color: #e3f2fd;
      padding: 16px;
      border-radius: 4px;
    }

    .contact-note mat-icon {
      color: #1976d2;
      margin-top: 2px;
    }

    .contact-note p {
      margin: 0;
      font-size: 14px;
      color: #1976d2;
    }

    .error-message {
      color: #f44336;
      font-size: 14px;
      padding: 8px;
      background-color: #ffebee;
      border-radius: 4px;
      text-align: center;
    }

    .join-button {
      align-self: center;
      padding: 12px 32px;
    }

    /* Status Card Styles */
    .status-info {
      text-align: center;
    }

    .party-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-left: 8px;
      background-color: #e8f5e8;
      color: #2e7d32;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: normal;
    }

    .party-badge mat-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    .position-display {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      margin: 32px 0;
    }

    .position-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3f51b5, #7986cb);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .position-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: white;
    }

    .position-text h2 {
      margin: 0 0 8px 0;
      color: #3f51b5;
    }

    .position-text p {
      margin: 0;
      color: #666;
    }

    .wait-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin: 32px 0;
      text-align: center;
    }

    .wait-time {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .wait-time mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #ff9800;
    }

    .wait-time h3 {
      margin: 0;
      font-size: 16px;
      color: #666;
    }

    .time-value {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      color: #ff9800;
    }

    .status-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .status-badge mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #4caf50;
    }

    .notification-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background-color: #fff3e0;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
    }

    .notification-info mat-icon {
      color: #ff9800;
    }

    .notification-info p {
      margin: 0;
      color: #ef6c00;
      font-weight: 500;
    }

    .actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 32px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .container {
        padding: 10px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .position-display {
        flex-direction: column;
        gap: 16px;
      }

      .wait-info {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .actions {
        flex-direction: column;
      }

      .search-container {
        padding: 10px 12px; /* Further reduced for mobile */
      }

      .search-input {
        font-size: 14px;
        padding: 8px 0; /* Consistent with desktop */
      }

      .search-input::placeholder {
        font-size: 13px; /* Slightly smaller on mobile */
      }

      .search-button {
        width: 30px; /* Further reduced for mobile */
        height: 30px;
      }

      .waitlist-content {
        padding-bottom: 85px; /* Increased space to account for margin */
      }

      .sticky-search {
        border-radius: 12px; /* Fully rounded for mobile */
        margin: 6px; /* Smaller margin for mobile */
      }

      /* Mobile waitlist adjustments */
      .waitlist-item {
        grid-template-columns: auto 1fr auto auto;
        gap: 12px;
        padding: 12px;
      }

      .party-size-center {
        width: 40px;
        height: 40px;
      }

      .party-icon-large {
        font-size: 18px !important;
        width: 18px !important;
        height: 18px !important;
      }

      .party-count {
        font-size: 9px;
      }

      .party-size-placeholder {
        width: 40px;
        height: 40px;
      }

      .customer-name {
        font-size: 14px;
      }

      .wait-time-display {
        font-size: 11px;
      }
    }
  `]
})
export class CustomerComponent implements OnInit {
  vendorId: number | null = null;
  currentCustomer: Customer | null = null;
  allCustomers: Customer[] = [];
  selectedTabIndex = 0; // Tab index for tab navigation
  
  searchForm: FormGroup;
  joinForm: FormGroup;
  
  isSearching = false;
  isJoining = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private waitlistService: WaitlistService,
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
      partySize: [1, [Validators.required, Validators.min(1), Validators.max(20)]]
    });
  }

  ngOnInit(): void {
    this.vendorId = Number(this.route.snapshot.paramMap.get('vendorId'));
    if (!this.vendorId) {
      // If no vendor ID, show a form to enter vendor ID or redirect to home
      this.router.navigate(['/home']);
      return;
    }

    this.loadWaitlist();
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

  getAnonymizedName(firstName: string): string {
    // Show only first letter followed by asterisks for privacy
    return firstName.charAt(0) + '***';
  }
}
