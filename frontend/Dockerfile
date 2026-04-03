# ArkhosAI Frontend Dockerfile for WSL2 Ubuntu
# Optimized for development with hot-reloading

FROM node:20-alpine as base

# Install dependencies
WORKDIR /app/frontend

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV VITE_API_URL=http://localhost:8000

# Development entrypoint with hot-reloading
CMD ["pnpm", "dev"]