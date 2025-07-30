#!/bin/bash

echo "🚀 Starting InLine Waitlist Management System"
echo "============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready &> /dev/null; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "   macOS: brew services start postgresql"
    echo "   Linux: sudo systemctl start postgresql"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies if needed
echo "📦 Checking dependencies..."

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Check if database exists
echo "🗄️  Checking database..."
if ! psql -U postgres -lqt | cut -d \| -f 1 | grep -qw waitlist_db; then
    echo "Creating database..."
    createdb -U postgres waitlist_db
fi

# Run migrations
echo "🔄 Running database migrations..."
cd backend && npm run migrate && cd ..

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Backend: cd backend && npm run dev"
echo "2. Frontend: cd frontend && npm start"
echo ""
echo "Then visit: http://localhost:4200"
