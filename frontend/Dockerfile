FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .

# Set build-time environment variables
ARG VITE_POSTHOG_KEY
ARG VITE_POSTHOG_HOST
ENV VITE_POSTHOG_KEY=$VITE_POSTHOG_KEY
ENV VITE_POSTHOG_HOST=$VITE_POSTHOG_HOST

RUN npm run build

# Production stage - serve with Node.js
FROM node:18-alpine

WORKDIR /app

# Install a simple static file server
RUN npm install -g serve

# Copy built app
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 8080

# Start the server
CMD ["serve", "-s", "dist", "-l", "8080"]