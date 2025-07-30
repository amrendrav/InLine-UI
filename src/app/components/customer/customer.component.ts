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
    MatSnackBarModule
  ],
  template: `
    <div class="container">
      <!-- Search Form -->
      <mat-card class="search-card" *ngIf="!currentCustomer">
        <mat-card-header>
          <mat-card-title>Join the Waitlist</mat-card-title>
          <mat-card-subtitle>Enter your information to join or check your position</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Search by Phone/Email -->
          <div class="search-section">
            <h3>Already in line? Check your position:</h3>
            <form [formGroup]="searchForm" (ngSubmit)="searchCustomer()">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Phone Number or Email</mat-label>
                <input matInput formControlName="identifier" 
                       placeholder="Enter phone number or email">
                <mat-error *ngIf="searchForm.get('identifier')?.hasError('required')">
                  Phone number or email is required
                </mat-error>
              </mat-form-field>
              
              <button mat-raised-button color="accent" type="submit" 
                      [disabled]="!searchForm.valid || isSearching">
                <mat-spinner diameter="20" *ngIf="isSearching"></mat-spinner>
                {{ isSearching ? 'Searching...' : 'Check Position' }}
              </button>
            </form>
          </div>

          <div class="divider">
            <span>OR</span>
          </div>

          <!-- Join Waitlist Form -->
          <div class="join-section">
            <h3>New customer? Join the waitlist:</h3>
            <form [formGroup]="joinForm" (ngSubmit)="joinWaitlist()">
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

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Phone Number</mat-label>
                <input matInput formControlName="phone" 
                       placeholder="(555) 123-4567">
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
                <p>We'll notify you via SMS when it's almost your turn. Email is optional for updates.</p>
              </div>

              <div class="error-message" *ngIf="errorMessage">
                {{ errorMessage }}
              </div>

              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="!joinForm.valid || isJoining">
                <mat-spinner diameter="20" *ngIf="isJoining"></mat-spinner>
                {{ isJoining ? 'Joining...' : 'Join Waitlist' }}
              </button>
            </form>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Customer Status Display -->
      <mat-card class="status-card" *ngIf="currentCustomer">
        <mat-card-header>
          <mat-card-title>Welcome, {{ currentCustomer.firstName }}!</mat-card-title>
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

      <!-- Waitlist Overview -->
      <mat-card class="waitlist-overview" *ngIf="allCustomers.length > 0">
        <mat-card-header>
          <mat-card-title>Current Waitlist</mat-card-title>
          <mat-card-subtitle>{{ allCustomers.length }} people in line</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="waitlist-items">
            <div class="waitlist-item" *ngFor="let customer of allCustomers; let i = index"
                 [class.current-customer]="currentCustomer && customer.id === currentCustomer.id">
              <div class="position-badge">{{ customer.position }}</div>
              <div class="customer-info">
                <div class="customer-name">
                  {{ customer.firstName }} 
                  <span *ngIf="currentCustomer && customer.id === currentCustomer.id">
                    (You)
                  </span>
                  <span *ngIf="!currentCustomer || customer.id !== currentCustomer.id">
                    {{ getAnonymizedName(customer.firstName) }}
                  </span>
                </div>
                <div class="wait-time">~{{ customer.waitTime }} min wait</div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    .search-card, .status-card, .waitlist-overview {
      margin: 20px 0;
    }

    .search-section, .join-section {
      margin: 24px 0;
    }

    .search-section h3, .join-section h3 {
      margin-bottom: 16px;
      color: #3f51b5;
    }

    .divider {
      text-align: center;
      margin: 32px 0;
      position: relative;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background-color: #ddd;
    }

    .divider span {
      background-color: white;
      padding: 0 16px;
      color: #666;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-field {
      width: 100%;
      margin: 16px 0;
    }

    .form-row .form-field {
      margin: 16px 0;
    }

    .contact-note {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      background-color: #e3f2fd;
      padding: 16px;
      border-radius: 4px;
      margin: 16px 0;
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

    .status-info {
      text-align: center;
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

    .waitlist-items {
      max-height: 400px;
      overflow-y: auto;
    }

    .waitlist-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-bottom: 1px solid #eee;
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
    }

    .customer-info {
      flex: 1;
    }

    .customer-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .wait-time {
      font-size: 12px;
      color: #666;
    }

    @media (max-width: 768px) {
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
    }
  `]
})
export class CustomerComponent implements OnInit {
  vendorId: number | null = null;
  currentCustomer: Customer | null = null;
  allCustomers: Customer[] = [];
  
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
      email: ['', Validators.email]
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
