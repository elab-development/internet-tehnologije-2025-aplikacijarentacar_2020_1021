# Development/Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for vite dev server)
RUN npm ci

# Copy source code
COPY . .

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 5173

# Use entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]

# Default command - can be overridden in docker-compose.yml
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]