# InLine - Waitlist Management System

A comprehensive waitlist management system built with Angular 20.1.3 frontend and Node.js backend.

## Features

### For Businesses (Vendors)
- **Subscription-based service** with multiple plans (Basic, Professional, Enterprise)
- **Real-time waitlist management** with dashboard
- **Customer notifications** via SMS and Email
- **Analytics and metrics** including wait times, served customers, peak hours
- **Secure authentication** with JWT tokens
- **Subscription management** with payment integration (Stripe ready)

### For Customers
- **Easy waitlist joining** with phone/email
- **Real-time position tracking** and wait time estimates
- **Smart notifications** when it's almost their turn
- **Privacy protection** - other customers see anonymized names
- **Search functionality** to find existing position
- **Mobile-friendly interface**

## Tech Stack

### Frontend
- Angular 20.1.3
- Angular Material UI
- TypeScript
- RxJS
- SCSS

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with Knex.js
- JWT Authentication
- Nodemailer (Email)
- Twilio (SMS)
- Stripe (Payments)

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (version 20 or higher)
- PostgreSQL (version 12 or higher)
- npm or yarn package manager

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Frontend
cd waitlist-app/frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Database Setup

1. **Install PostgreSQL** if not already installed
2. **Create a database**:
   ```sql
   CREATE DATABASE waitlist_db;
   CREATE USER postgres WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE waitlist_db TO postgres;
   ```

3. **Run migrations**:
   ```bash
   cd backend
   npm run migrate
   ```

### 3. Environment Configuration

1. **Copy environment file**:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Configure environment variables** in `.env`:

   ```env
   # Database
   DATABASE_URL=postgresql://postgres:password@localhost:5432/waitlist_db
   
   # JWT Secret (change this!)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Email Configuration (Gmail example)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Twilio Configuration (for SMS)
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=+1234567890
   
   # Stripe Configuration (for payments)
   STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
   ```

### 4. Third-Party Service Setup

#### Email (Nodemailer with Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an app password: Google Account > Security > App passwords
3. Use the app password in `EMAIL_PASS`

#### SMS (Twilio)
1. Sign up for Twilio account
2. Get your Account SID and Auth Token
3. Purchase a phone number
4. Update the environment variables

#### Payments (Stripe)
1. Create a Stripe account
2. Get your test API keys
3. Set up webhooks for subscription management

## Running the Application

### Development Mode

1. **Start the backend**:
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on http://localhost:3000

2. **Start the frontend**:
   ```bash
   cd frontend
   npm start
   ```
   Frontend will run on http://localhost:4200

### Production Mode

1. **Build the applications**:
   ```bash
   # Frontend
   cd frontend
   npm run build
   
   # Backend
   cd ../backend
   npm run build
   ```

2. **Start the backend**:
   ```bash
   cd backend
   npm start
   ```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new vendor
- `POST /api/auth/login` - Login vendor

### Waitlist Endpoints
- `POST /api/waitlist/join` - Customer joins waitlist
- `POST /api/waitlist/search` - Search for customer by phone/email
- `GET /api/waitlist/:vendorId` - Get vendor's waitlist (authenticated)
- `PATCH /api/waitlist/customer/:customerId` - Update customer status
- `DELETE /api/waitlist/customer/:customerId` - Remove customer
- `POST /api/waitlist/customer/:customerId/notify` - Send notification
- `GET /api/waitlist/:vendorId/metrics` - Get vendor metrics

### Subscription Endpoints
- `GET /api/subscription/:vendorId` - Get subscription details

## Usage Guide

### For Vendors

1. **Registration**: Visit the homepage and click "Get Started"
2. **Choose a Plan**: Select from Basic ($29), Professional ($49), or Enterprise ($99)
3. **Dashboard Access**: After registration, access your dashboard
4. **Share Link**: Copy and share your waitlist link with customers
5. **Manage Queue**: View customers, send notifications, mark as served

### For Customers

1. **Join Waitlist**: Visit the vendor's waitlist link
2. **Provide Information**: Enter name and phone/email
3. **Get Updates**: Receive real-time position and wait time
4. **Notifications**: Get notified when it's almost your turn

## Features in Detail

### Vendor Dashboard
- **Real-time Metrics**: Total customers, average wait time, customers served today
- **Waitlist Management**: View all customers with positions and contact info
- **Customer Actions**: Notify, mark as served, or remove from queue
- **Analytics Tab**: (Coming soon) Advanced insights and reports
- **Subscription Tab**: Manage billing and subscription details

### Customer Experience
- **Smart Search**: Check existing position with phone/email
- **Real-time Updates**: See current position and estimated wait time
- **Privacy Protection**: Other customers' names are anonymized
- **Notifications**: Automatic alerts when position is top 3 and wait < 10 min

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers

## Deployment

### Using Docker (Recommended)

1. **Create Docker files** (not included, but recommended)
2. **Set up environment variables** for production
3. **Deploy to cloud provider** (AWS, Google Cloud, Azure)

### Manual Deployment

1. **Set up PostgreSQL** on production server
2. **Configure environment variables** for production
3. **Build applications** and deploy static files
4. **Use PM2** or similar for process management
5. **Set up reverse proxy** (Nginx) for HTTPS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact [your-email@example.com] or create an issue in the repository.

## Roadmap

- [ ] Advanced analytics dashboard
- [ ] Multi-location support
- [ ] Mobile app (React Native)
- [ ] Voice call notifications
- [ ] Integration with POS systems
- [ ] Customer feedback system
- [ ] Advanced reporting features
vendor
    "email": "test@example.com",
    "password": "testpassword123"