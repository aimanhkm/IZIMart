# Build stage
FROM oven/bun:1-alpine as build
WORKDIR /app

# Copy package definitions
COPY package.json bun.lock* ./

# Install dependencies using bun
RUN bun install

# Copy source code and build
COPY . .
RUN bun run build

# Production stage
FROM nginx:alpine
# Copy our custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built static files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
