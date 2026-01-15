# Docker Build dan Run Examples

## Build Docker Image

```bash
# Build image
docker build -t live-tracking-be:latest .

# Build dengan tag specific
docker build -t live-tracking-be:1.0.0 .

# Build dengan build args
docker build \
  --build-arg NODE_ENV=production \
  -t live-tracking-be:latest .
```

## Run Container

```bash
# Run basic
docker run -p 3000:3000 live-tracking-be:latest

# Run dengan environment variables
docker run \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@localhost:5432/dbname" \
  -e JWT_SECRET="your-secret-key" \
  live-tracking-be:latest

# Run dengan volume (untuk development)
docker run \
  -p 3000:3000 \
  -v $(pwd):/app \
  -e NODE_ENV=development \
  live-tracking-be:latest

# Run dalam background
docker run -d \
  -p 3000:3000 \
  --name live-tracking-be \
  live-tracking-be:latest

# Run dengan resource limits
docker run \
  -p 3000:3000 \
  --memory="512m" \
  --cpus="1" \
  live-tracking-be:latest

# Run dengan restart policy
docker run \
  -p 3000:3000 \
  --restart=unless-stopped \
  live-tracking-be:latest
```

## Container Management

```bash
# List running containers
docker ps

# Stop container
docker stop live-tracking-be

# Start container
docker start live-tracking-be

# Remove container
docker rm live-tracking-be

# View logs
docker logs live-tracking-be
docker logs -f live-tracking-be  # Follow logs

# Execute command in running container
docker exec -it live-tracking-be sh
```

## Push ke Registry

```bash
# Tag untuk registry
docker tag live-tracking-be:latest docker.io/username/live-tracking-be:latest

# Login ke Docker Hub
docker login

# Push image
docker push docker.io/username/live-tracking-be:latest

# Push ke GitHub Container Registry
docker tag live-tracking-be:latest ghcr.io/username/live-tracking-be:latest
docker login ghcr.io
docker push ghcr.io/username/live-tracking-be:latest
```

## Docker Compose (optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/tracking
      - JWT_SECRET=your-secret-key
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=tracking
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

Run with Docker Compose:

```bash
docker-compose up -d
docker-compose down
docker-compose logs -f app
```
