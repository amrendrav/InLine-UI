import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { 
    path: 'home', 
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  { 
    path: 'vendor/register', 
    loadComponent: () => import('./components/vendor-registration/vendor-registration.component').then(m => m.VendorRegistrationComponent)
  },
  { 
    path: 'vendor/login', 
    loadComponent: () => import('./components/vendor-login/vendor-login.component').then(m => m.VendorLoginComponent)
  },
  { 
    path: 'vendor/dashboard', 
    loadComponent: () => import('./components/vendor-dashboard/vendor-dashboard.component').then(m => m.VendorDashboardComponent)
  },
  { 
    path: 'customer/:vendorId', 
    loadComponent: () => import('./components/customer/customer.component').then(m => m.CustomerComponent)
  },
  { 
    path: 'customer', 
    loadComponent: () => import('./components/customer/customer.component').then(m => m.CustomerComponent)
  },
  { path: '**', redirectTo: '/home' }
];
