# 🚀 InLine Waitlist Management - Developer Guide

## Quick Start

### Prerequisites
- Node.js v22.13.0 (LTS) via nvm
- PostgreSQL 14
- npm v10.9.2+

### 🏃‍♂️ One-Command Startup
```bash
# Navigate to project root and run:
./start.sh
```

### 🔧 Manual Startup

#### 1. Set Node.js Version
```bash
nvm use v22.13.0
```

#### 2. Start Database
```bash
brew services start postgresql@14
```

#### 3. Start Backend (Terminal 1)
```bash
cd backend
PORT=3001 npm run dev
```

#### 4. Start Frontend (Terminal 2)
```bash
cd frontend
npm start
```

## 🌐 Application URLs

- **Frontend (Angular)**: http://localhost:4200
- **Backend API**: http://localhost:3001
- **Test Interface**: file:///.../frontend/simple-test.html

## 📋 Available API Endpoints

### Authentication
- `POST /api/auth/register` - Vendor registration
- `POST /api/auth/login` - Vendor login

### Waitlist Management
- `POST /api/waitlist/join` - Customer joins waitlist
- `POST /api/waitlist/search` - Search for customer
- `GET /api/waitlist/:vendorId` - Get vendor's waitlist (auth required)
- `PATCH /api/waitlist/customer/:customerId` - Update customer (auth required)
- `DELETE /api/waitlist/customer/:customerId` - Remove customer (auth required)

### Subscription
- `GET /api/subscription/:vendorId` - Get subscription details (auth required)

## 🧪 Testing

### Frontend Testing
Navigate to http://localhost:4200 and test:
1. Home page loads correctly
2. Vendor registration form
3. Vendor login form
4. Customer waitlist join
5. Vendor dashboard (after login)

### API Testing
Use the HTML test interface or curl commands:

```bash
# Register a vendor
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","businessName":"Test Business","contactName":"Test User","phone":"+1234567890","subscriptionPlan":"basic"}'

# Customer joins waitlist
curl -X POST http://localhost:3001/api/waitlist/join \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","phone":"+1987654321","vendorId":1}'
```

## 🗄️ Database Commands

```bash
# Connect to database
psql waitlist_db

# View tables
\dt

# Check vendors
SELECT * FROM vendors;

# Check customers
SELECT * FROM customers;

# Run migrations
cd backend && npm run migrate
```

## 🛠️ Development Commands

### Backend
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run migrate      # Run database migrations
npm test             # Run tests
```

### Frontend
```bash
cd frontend
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
npm run lint         # Lint code
```

## 🔧 Configuration Files

- **Backend Config**: `backend/.env`
- **Database Config**: `backend/knexfile.ts`
- **Angular Config**: `frontend/angular.json`
- **TypeScript Config**: `frontend/tsconfig.json`

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   lsof -ti:3001 | xargs kill -9  # Kill process on port 3001
   lsof -ti:4200 | xargs kill -9  # Kill process on port 4200
   ```

2. **Database Connection Error**
   ```bash
   brew services restart postgresql@14
   ```

3. **Node Version Issues**
   ```bash
   nvm use v22.13.0  # Always use this version
   ```

4. **Frontend Build Errors**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📝 Environment Variables

Create `backend/.env` with:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://pdomm01@localhost:5432/waitlist_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional: Email & SMS services
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

## ✅ Health Check

Run this quick health check to ensure everything is working:

```bash
# 1. Check Node version
node --version  # Should show v22.13.0

# 2. Check PostgreSQL
brew services list | grep postgresql  # Should show "started"

# 3. Check backend
curl http://localhost:3001  # Should return {"message":"Endpoint not found"}

# 4. Check frontend  
curl -s http://localhost:4200 | grep "InLine"  # Should show title

# 5. Test API
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"health@test.com","password":"test123","businessName":"Health Check","contactName":"Test","phone":"+1111111111","subscriptionPlan":"basic"}'
```

All systems operational! 🎉
