#!/bin/bash

# Wild Rift Draft Tool - Start Script
# This script starts both the backend API and frontend server

echo "🎮 Wild Rift Draft Tool - Starting Application..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Cleanup existing processes on ports 3000 and 8000
echo "🧹 Cleaning up ports 3000 and 8000..."
PIDS=$(lsof -ti :8000,3000)
if [ -n "$PIDS" ]; then
    echo "Killing conflicting processes: $PIDS"
    kill -9 $PIDS
fi

# Start background processes
echo "📦 Starting Backend API on port 8000..."
source venv/bin/activate
cd backend
python api.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 2

echo "🌐 Starting Frontend Server on port 3000..."
cd frontend-react
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Application started successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📖 API Documentation: http://localhost:8000/docs"
echo "  🎯 Web Interface:     http://localhost:3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop both servers..."
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; echo ''; echo '👋 Servers stopped.'; exit 0" INT
wait
