#!/bin/bash

# InLine Waitlist Management - Startup Script
echo "🚀 Starting InLine Waitlist Management Application"
echo "=================================================="

# Ensure we're using the correct Node.js version
echo "📦 Setting Node.js version to v22.13.0..."
nvm use v22.13.0

# Check if PostgreSQL is running
if ! brew services list | grep -q "postgresql@14.*started"; then
    echo "🗄️ Starting PostgreSQL..."
    brew services start postgresql@14
else
    echo "✅ PostgreSQL is already running"
fi

# Start the backend server
echo "🔧 Starting backend server on port 3001..."
cd "$(dirname "$0")/backend"
PORT=3001 npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start the frontend server
echo "🌐 Starting frontend server on port 4200..."
cd "../frontend"
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Application started successfully!"
echo "🌐 Frontend: http://localhost:4200"
echo "🔧 Backend API: http://localhost:3001"
echo "🧪 Test Interface: file://$(pwd)/simple-test.html"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for background processes
wait
