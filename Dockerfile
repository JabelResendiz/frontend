# Multi-stage Dockerfile for building and serving the Vite React frontend

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies (prefer npm ci when lockfile exists)
COPY package*.json ./
RUN npm ci --silent || npm install --silent

# Copy source and build
COPY . .
RUN npm run build

# Production stage: serve with nginx
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
