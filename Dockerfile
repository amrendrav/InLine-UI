# Use Node.js 22.13.0
FROM node:22.13.0-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build:prod

# Install only production dependencies and http-server globally
RUN npm ci --only=production && npm install -g http-server

# Expose port
EXPOSE $PORT

# Start the application using http-server
CMD ["sh", "-c", "http-server dist/waitlist-frontend -p $PORT -a 0.0.0.0"]
