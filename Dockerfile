# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./
COPY prisma ./prisma

# Install all dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY src ./src

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install OpenSSL 1.1 dan dependencies yang diperlukan Prisma
RUN apk add --no-cache openssl1.1-compat

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --legacy-peer-deps --omit=dev

# Copy Prisma schema
COPY prisma ./prisma

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist

# Copy pre-generated Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/src/main"]
