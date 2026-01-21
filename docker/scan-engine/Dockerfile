FROM node:20-slim

# Install system deps (git + native build tools)
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install node dependencies (cached layer)
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy scan engine code
COPY . .

# Create work directory for repos
RUN mkdir -p /work

# Entry point
ENTRYPOINT ["node", "entrypoint.js"]
