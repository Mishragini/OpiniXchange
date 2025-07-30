# Use a base image with Docker and Docker Compose
FROM docker/compose:1.29.2

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

# Set the working directory
WORKDIR /app

# Copy the docker-compose file first
COPY docker-compose.yml .

# Copy the entire project
COPY . .

# Create necessary directories
RUN mkdir -p postgres-data redis-data

# Expose the main ports
EXPOSE 3000 3001 8080

# Start the application
CMD ["docker-compose", "up", "-d"] 