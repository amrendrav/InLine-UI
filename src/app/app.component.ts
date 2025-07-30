import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary">
      <mat-icon>queue</mat-icon>
      <span style="margin-left: 8px;">InLine</span>
      <span class="spacer"></span>
      <button mat-button routerLink="/home">Home</button>
      <button mat-button routerLink="/vendor/login">Vendor Login</button>
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
}
