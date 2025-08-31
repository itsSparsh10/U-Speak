#!/bin/bash

echo "🚀 Starting USpeak Pro MongoDB with Docker Compose..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start MongoDB and Mongo Express
docker-compose up -d

echo "✅ MongoDB started successfully!"
echo "📊 MongoDB is running on: mongodb://localhost:27017"
echo "🌐 Mongo Express (web UI) is running on: http://localhost:8081"
echo "👤 Default credentials: admin / password123"
echo ""
echo "To stop MongoDB, run: docker-compose down"
echo "To view logs, run: docker-compose logs -f mongodb"
