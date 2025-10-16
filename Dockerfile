# Use official Node 20 image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json & lockfile first
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port (for offline testing)
EXPOSE 4000

# Start the app in production
CMD ["node", "dist/server.js"]
