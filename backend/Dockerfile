FROM node:20-slim

# Install system deps
RUN apt-get update && apt-get install -y \
  git \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  python3 \
  make \
  g++ \
  && rm -rf /var/lib/apt/lists/*

# Install Docker CLI
RUN curl -fsSL https://get.docker.com | sh

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
