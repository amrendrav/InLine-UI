import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { WaitlistService } from '../../services/waitlist.service';
import { Customer, WaitlistMetrics, Vendor } from '../../models';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container" *ngIf="currentVendor">
      <div class="header">
        <h1>{{ currentVendor.businessName }} Dashboard</h1>
        <div class="header-actions">
          <button mat-raised-button color="accent" (click)="copyWaitlistLink()">
            <mat-icon>link</mat-icon>
            Share Waitlist Link
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
                  <div class="metric-label">Customers in Queue</div>
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

                    <ng-container matColumnDef="waitTime">
                      <th mat-header-cell *matHeaderCellDef>Wait Time</th>
                      <td mat-cell *matCellDef="let customer">
                        <div class="wait-time">{{ customer.waitTime }}min</div>
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
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .header h1 {
      margin: 0;
      color: #3f51b5;
    }

    .header-actions {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .dashboard-content, .analytics-content, .subscription-content {
      padding: 20px 0;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .waitlist-card {
      margin-top: 20px;
    }

    .waitlist-table {
      width: 100%;
      overflow-x: auto;
    }

    .full-width-table {
      width: 100%;
    }

    .position-badge {
      background-color: #3f51b5;
      color: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
    }

    .customer-info {
      display: flex;
      flex-direction: column;
    }

    .customer-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .customer-contact {
      font-size: 12px;
      color: #666;
    }

    .wait-time {
      font-weight: 500;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .subscription-status {
      margin: 20px 0;
    }

    .subscription-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .header-actions {
        width: 100%;
        justify-content: center;
      }

      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .subscription-actions {
        flex-direction: column;
      }
    }
  `]
})
export class VendorDashboardComponent implements OnInit {
  currentVendor: Vendor | null = null;
  customers: Customer[] = [];
  metrics: WaitlistMetrics | null = null;
  displayedColumns: string[] = ['position', 'name', 'waitTime', 'status', 'actions'];

  constructor(
    private authService: AuthService,
    private waitlistService: WaitlistService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentVendor = this.authService.getCurrentVendor();
    if (!this.currentVendor) {
      this.router.navigate(['/vendor/login']);
      return;
    }

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    if (!this.currentVendor?.id) return;

    this.waitlistService.getWaitlist(this.currentVendor.id).subscribe({
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
  }

  refreshWaitlist(): void {
    this.loadDashboardData();
    this.snackBar.open('Waitlist refreshed', 'Close', { duration: 2000 });
  }

  copyWaitlistLink(): void {
    const link = `${window.location.origin}/customer/${this.currentVendor?.id}`;
    navigator.clipboard.writeText(link).then(() => {
      this.snackBar.open('Waitlist link copied to clipboard!', 'Close', { duration: 3000 });
    });
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
}
