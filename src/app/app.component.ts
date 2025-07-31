import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule, CommonModule],
  template: `
    <mat-toolbar color="primary">
      <mat-icon>queue</mat-icon>
      <span style="margin-left: 8px;">InLine</span>
      <span class="spacer"></span>
      <!-- <button mat-button routerLink="/home" *ngIf="!isCustomerPage">Home</button>
      <button mat-button routerLink="/vendor/login" *ngIf="!isCustomerPage">Vendor Login</button> -->
    </mat-toolbar>
    
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    
    main {
      min-height: calc(100vh - 64px);
      background-color: #f5f5f5;
    }
  `]
})
export class AppComponent {
  title = 'InLine - Waitlist Management System';
  //isCustomerPage = true;

  constructor(private router: Router) {
    // Listen to route changes to determine if we're on a customer page
    // this.router.events.pipe(
    //   filter(event => event instanceof NavigationEnd)
    // ).subscribe((event: NavigationEnd) => {
    //   this.isCustomerPage = event.url.startsWith('/customer');
    // });
  }
}
