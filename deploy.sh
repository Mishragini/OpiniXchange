#!/bin/bash

# OpiniXchange Deployment Script
# This script sets up everything on a fresh Ubuntu VPS

echo "🚀 Starting OpiniXchange deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
echo "📋 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
echo "📚 Installing Git..."
sudo apt install git -y

# Clone the repository
echo "📥 Cloning OpiniXchange repository..."
git clone https://github.com/YOUR_USERNAME/OpiniXchange.git
cd OpiniXchange

# Create necessary directories
echo "📁 Creating data directories..."
mkdir -p postgres-data redis-data

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R $USER:$USER postgres-data redis-data

# Start the application
echo "🚀 Starting OpiniXchange..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check status
echo "📊 Checking service status..."
docker-compose ps

echo "✅ Deployment complete!"
echo "🌐 Your application should be available at:"
echo "   Frontend: http://$(curl -s ifconfig.me):3001"
echo "   API: http://$(curl -s ifconfig.me):3000"
echo ""
echo "📝 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down" 