# =========================
# Build stage
# =========================
FROM node:20-slim AS builder

WORKDIR /app

# System deps (important for Prisma)
RUN apt-get update \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

# Copy config & dependencies
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./
COPY prisma ./prisma

# Install all deps
RUN npm install --legacy-peer-deps

# Copy source & build
COPY src ./src
RUN npm run build

# =========================
# Production stage
# =========================
FROM node:20-slim

WORKDIR /app

# System deps (important for Prisma)
RUN apt-get update \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

# Copy package & prisma
COPY package*.json ./
COPY prisma ./prisma

# Install prod deps only
RUN npm install --legacy-peer-deps --omit=dev

# Generate Prisma Client in runtime environment
RUN npx prisma generate

# Copy compiled app
COPY --from=builder /app/dist ./dist

EXPOSE 5557

CMD ["node", "dist/src/main"]
