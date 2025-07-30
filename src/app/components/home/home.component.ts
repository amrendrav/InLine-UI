import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container">
      <div class="hero-section">
        <h1>Welcome to InLine</h1>
        <p class="subtitle">The smart waitlist management system for businesses</p>
        
        <div class="cards-container">
          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>business</mat-icon>
              <mat-card-title>For Businesses</mat-card-title>
              <mat-card-subtitle>Manage your customer waitlist efficiently</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <ul>
                <li>Real-time waitlist management</li>
                <li>Customer notifications</li>
                <li>Analytics and insights</li>
                <li>Subscription management</li>
              </ul>
            </mat-card-content>
            <mat-card-actions>
              <button mat-raised-button color="primary" (click)="navigateToVendorRegistration()">
                Get Started
              </button>
              <button mat-button (click)="navigateToVendorLogin()">
                Already a member? Login
              </button>
            </mat-card-actions>
          </mat-card>

          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>people</mat-icon>
              <mat-card-title>For Customers</mat-card-title>
              <mat-card-subtitle>Join waitlists and get notified</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <ul>
                <li>Easy waitlist registration</li>
                <li>Real-time wait time estimates</li>
                <li>SMS and email notifications</li>
                <li>View your position in line</li>
              </ul>
            </mat-card-content>
            <mat-card-actions>
              <button mat-raised-button color="accent" (click)="navigateToCustomer()">
                Join a Waitlist
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>

      <div class="features-section">
        <h2>Why Choose InLine?</h2>
        <div class="features-grid">
          <div class="feature-item">
            <mat-icon>schedule</mat-icon>
            <h3>Real-time Updates</h3>
            <p>Get live updates on wait times and queue positions</p>
          </div>
          <div class="feature-item">
            <mat-icon>notifications</mat-icon>
            <h3>Smart Notifications</h3>
            <p>Automatic SMS and email alerts when it's your turn</p>
          </div>
          <div class="feature-item">
            <mat-icon>analytics</mat-icon>
            <h3>Analytics Dashboard</h3>
            <p>Comprehensive insights into your business operations</p>
          </div>
          <div class="feature-item">
            <mat-icon>payment</mat-icon>
            <h3>Flexible Pricing</h3>
            <p>Choose a subscription plan that fits your business needs</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .hero-section {
      text-align: center;
      padding: 60px 0;
    }

    h1 {
      font-size: 3rem;
      margin-bottom: 20px;
      color: #3f51b5;
    }

    .subtitle {
      font-size: 1.2rem;
      color: #666;
      margin-bottom: 40px;
    }

    .cards-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 30px;
      margin: 40px 0;
    }

    .feature-card {
      padding: 20px;
      height: fit-content;
    }

    .feature-card ul {
      list-style-type: none;
      padding: 0;
    }

    .feature-card li {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .feature-card li:before {
      content: "✓";
      color: #4caf50;
      font-weight: bold;
      margin-right: 10px;
    }

    .features-section {
      padding: 60px 0;
      text-align: center;
    }

    .features-section h2 {
      font-size: 2.5rem;
      margin-bottom: 40px;
      color: #3f51b5;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
      margin-top: 40px;
    }

    .feature-item {
      padding: 30px 20px;
      text-align: center;
    }

    .feature-item mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #3f51b5;
      margin-bottom: 20px;
    }

    .feature-item h3 {
      margin: 20px 0 15px;
      color: #333;
    }

    .feature-item p {
      color: #666;
      line-height: 1.6;
    }

    mat-card-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    @media (max-width: 768px) {
      .cards-container {
        grid-template-columns: 1fr;
      }
      
      h1 {
        font-size: 2rem;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateToVendorRegistration(): void {
    this.router.navigate(['/vendor/register']);
  }

  navigateToVendorLogin(): void {
    this.router.navigate(['/vendor/login']);
  }

  navigateToCustomer(): void {
    this.router.navigate(['/customer']);
  }
}
