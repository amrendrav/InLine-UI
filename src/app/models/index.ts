export interface Vendor {
  id?: number;
  email: string;
  businessName: string;
  contactName: string;
  phone: string;
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  subscriptionPlan: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Customer {
  id?: number;
  vendorId: number;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position: number;
  waitTime: number;
  status: 'waiting' | 'notified' | 'served' | 'cancelled';
  joinedAt: Date;
  notifiedAt?: Date;
  servedAt?: Date;
}

export interface WaitlistMetrics {
  totalCustomers: number;
  averageWaitTime: number;
  customersServedToday: number;
  currentWaitTime: number;
  peakHours: string[];
}

export interface Subscription {
  id?: number;
  vendorId: number;
  plan: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  businessName: string;
  contactName: string;
  phone: string;
  subscriptionPlan: string;
}

export interface AuthResponse {
  token: string;
  vendor: Vendor;
}

export interface CustomerJoinRequest {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  vendorId: number;
}

export interface CustomerSearchRequest {
  identifier: string; // email or phone
  vendorId: number;
}
