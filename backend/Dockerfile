# Dockerfile for backend
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm cache clean --force && rm -rf node_modules && npm install

# Copy source code
COPY . .

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chmod 777 uploads

# Build if there's a build script
RUN npm run build || echo "No build script"

EXPOSE 3000

CMD ["npm", "start"]