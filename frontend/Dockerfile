# Stage 1: Build production React bundle
FROM node:20-alpine AS builder

WORKDIR /app

# Accept API base URL build argument (defaults to reverse proxy /api)
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Install dependencies using clean install
COPY package*.json ./
RUN npm ci

# Copy source files and compile production bundle
COPY . .
RUN npm run build

# Stage 2: Lightweight Nginx production server
FROM nginx:1.27-alpine AS runtime

# Remove default configuration and install custom config
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
