import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-vendor-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container">
      <mat-card class="registration-card">
        <mat-card-header>
          <mat-card-title>Register Your Business</mat-card-title>
          <mat-card-subtitle>Join InLine and start managing your waitlist today</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="registrationForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Business Name</mat-label>
                <input matInput formControlName="businessName" required>
                <mat-error *ngIf="registrationForm.get('businessName')?.hasError('required')">
                  Business name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Contact Name</mat-label>
                <input matInput formControlName="contactName" required>
                <mat-error *ngIf="registrationForm.get('contactName')?.hasError('required')">
                  Contact name is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" required>
                <mat-error *ngIf="registrationForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="registrationForm.get('email')?.hasError('email')">
                  Please enter a valid email
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Phone</mat-label>
                <input matInput formControlName="phone" required>
                <mat-error *ngIf="registrationForm.get('phone')?.hasError('required')">
                  Phone number is required
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" required>
              <mat-error *ngIf="registrationForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="registrationForm.get('password')?.hasError('minlength')">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Subscription Plan</mat-label>
              <mat-select formControlName="subscriptionPlan" required>
                <mat-option value="basic">Basic - $29/month</mat-option>
                <mat-option value="professional">Professional - $49/month</mat-option>
                <mat-option value="enterprise">Enterprise - $99/month</mat-option>
              </mat-select>
              <mat-error *ngIf="registrationForm.get('subscriptionPlan')?.hasError('required')">
                Please select a subscription plan
              </mat-error>
            </mat-form-field>

            <div class="plan-details">
              <div class="plan-info" *ngIf="registrationForm.get('subscriptionPlan')?.value === 'basic'">
                <h4>Basic Plan Features:</h4>
                <ul>
                  <li>Up to 50 customers in waitlist</li>
                  <li>Email notifications</li>
                  <li>Basic analytics</li>
                  <li>Email support</li>
                </ul>
              </div>
              
              <div class="plan-info" *ngIf="registrationForm.get('subscriptionPlan')?.value === 'professional'">
                <h4>Professional Plan Features:</h4>
                <ul>
                  <li>Up to 200 customers in waitlist</li>
                  <li>Email & SMS notifications</li>
                  <li>Advanced analytics</li>
                  <li>Priority support</li>
                  <li>Custom branding</li>
                </ul>
              </div>
              
              <div class="plan-info" *ngIf="registrationForm.get('subscriptionPlan')?.value === 'enterprise'">
                <h4>Enterprise Plan Features:</h4>
                <ul>
                  <li>Unlimited customers</li>
                  <li>Email & SMS notifications</li>
                  <li>Full analytics suite</li>
                  <li>24/7 priority support</li>
                  <li>Custom branding</li>
                  <li>API access</li>
                  <li>Multiple locations</li>
                </ul>
              </div>
            </div>

            <div class="error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="!registrationForm.valid || isLoading">
                <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                {{ isLoading ? 'Creating Account...' : 'Create Account & Setup Payment' }}
              </button>
              
              <button mat-button type="button" (click)="goToLogin()">
                Already have an account? Login
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      padding: 20px;
    }

    .registration-card {
      width: 100%;
      max-width: 600px;
      padding: 20px;
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

    .plan-details {
      margin: 20px 0;
    }

    .plan-info {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
      margin: 16px 0;
    }

    .plan-info h4 {
      margin: 0 0 12px 0;
      color: #3f51b5;
    }

    .plan-info ul {
      margin: 0;
      padding-left: 20px;
    }

    .plan-info li {
      margin: 8px 0;
    }

    .form-actions {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 24px;
    }

    mat-spinner {
      margin-right: 8px;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .registration-card {
        margin: 10px;
      }
    }
  `]
})
export class VendorRegistrationComponent {
  registrationForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      businessName: ['', Validators.required],
      contactName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      subscriptionPlan: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.register(this.registrationForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          // In a real app, this would redirect to payment processing
          // For demo purposes, we'll go straight to dashboard
          this.router.navigate(['/vendor/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/vendor/login']);
  }
}
