#!/bin/sh
set -e

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/vite" ]; then
  echo "Installing dependencies..."
  npm ci
fi

# Execute the command passed as arguments
exec "$@"