// Test file to verify component imports are working
import { HomeComponent } from './components/home/home.component';
import { VendorRegistrationComponent } from './components/vendor-registration/vendor-registration.component';
import { VendorLoginComponent } from './components/vendor-login/vendor-login.component';
import { VendorDashboardComponent } from './components/vendor-dashboard/vendor-dashboard.component';
import { CustomerComponent } from './components/customer/customer.component';

// This file should compile without errors if all imports are working
console.log('All components imported successfully:', {
  HomeComponent,
  VendorRegistrationComponent,
  VendorLoginComponent,
  VendorDashboardComponent,
  CustomerComponent
});
