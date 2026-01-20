# Job Tracking Backend API - Documentation

## ✅ Swagger Status

**Status**: ✓ **Installed and Running**

Swagger/OpenAPI documentation tersedia di: **http://localhost:3000/api**

### Packages Terinstall:

- `@nestjs/swagger`: ^7.4.0
- `swagger-ui-express`: ^5.0.1

---

## 📋 API Endpoints Summary

### Health & Status (Public)

| Method | Path      | Description                      |
| ------ | --------- | -------------------------------- |
| GET    | `/`       | Welcome message                  |
| GET    | `/health` | Health check dengan Redis status |

### Authentication (Public)

| Method | Path             | Description                  |
| ------ | ---------------- | ---------------------------- |
| POST   | `/auth/register` | Register user baru           |
| POST   | `/auth/login`    | Login dan dapatkan JWT token |

### Jobs Management (Public)

| Method | Path                   | Description                             |
| ------ | ---------------------- | --------------------------------------- |
| POST   | `/jobs`                | Buat job baru dengan pickup & delivery  |
| GET    | `/jobs`                | Dapatkan semua jobs (exclude deleted)   |
| GET    | `/jobs/:jobUuid`       | Dapatkan job details (dari Redis cache) |
| DELETE | `/jobs/:jobUuid`       | Soft delete job                         |
| POST   | `/jobs/:jobUuid/start` | Start job (status → in_progress)        |

### Tracking (Public)

| Method | Path                          | Description           |
| ------ | ----------------------------- | --------------------- |
| POST   | `/tracking/push-location`     | Push current location |
| GET    | `/tracking/:jobUuid/location` | Get current location  |

---

## 📦 Sample Payloads

### 1. Register User

**POST** `/auth/register`

**Request:**

```json
{
  "email": "john@example.com",
  "fullName": "John Doe",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "fullName": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. Login User

**POST** `/auth/login`

**Request:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "user": {
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "fullName": "John Doe",
    "email": "john@example.com",
    "status": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Create Job

**POST** `/jobs`

**Request:**

```json
{
  "description": "Deliver package to customer in Jakarta",
  "assignedTo": "123e4567-e89b-12d3-a456-426614174000",
  "pickup": {
    "address": "Warehouse, Jl. Sudirman No. 123, Jakarta",
    "lat": -6.2088,
    "lng": 106.8456
  },
  "delivery": {
    "address": "Customer Office, Jl. Gatot Subroto No. 456, Jakarta",
    "lat": -6.225,
    "lng": 106.799,
    "polyline": "enc:{wsiFljiiBrB~A...",
    "distanceKm": 5.2,
    "estimateDuration": 15
  }
}
```

**Note:** `jobCode` di-generate otomatis dengan format `JOB-YYYYMMDD-XXXXX` (e.g., JOB-20260114-00001)

**Response:**

```json
{
  "message": "Job created successfully",
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "jobCode": "JOB-2026-001",
    "jobStatus": "planned",
    "description": "Deliver package to customer in Jakarta",
    "assignedTo": "123e4567-e89b-12d3-a456-426614174000",
    "createdAt": "2026-01-14T16:30:00Z",
    "updatedAt": "2026-01-14T16:30:00Z",
    "pickup": {
      "uuid": "660e8400-e29b-41d4-a716-446655440001",
      "jobUuid": "550e8400-e29b-41d4-a716-446655440000",
      "address": "Warehouse, Jl. Sudirman No. 123, Jakarta",
      "lat": -6.2088,
      "lng": 106.8456,
      "createdAt": "2026-01-14T16:30:00Z",
      "updatedAt": "2026-01-14T16:30:00Z"
    },
    "delivery": {
      "uuid": "770e8400-e29b-41d4-a716-446655440002",
      "jobUuid": "550e8400-e29b-41d4-a716-446655440000",
      "address": "Customer Office, Jl. Gatot Subroto No. 456, Jakarta",
      "lat": -6.225,
      "lng": 106.799,
      "polyline": "enc:{wsiFljiiBrB~A...",
      "distanceKm": 5.2,
      "eta": null,
      "etd": null,
      "estimateDuration": 15,
      "atd": null,
      "ata": null,
      "actualDuration": null,
      "createdAt": "2026-01-14T16:30:00Z",
      "updatedAt": "2026-01-14T16:30:00Z"
    }
  }
}
```

---

### 4. Get All Jobs

**GET** `/jobs`

**Response:**

```json
{
  "data": [
    {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "jobCode": "JOB-2026-001",
      "jobStatus": "planned",
      "description": "Deliver package to customer in Jakarta",
      "assignedTo": "123e4567-e89b-12d3-a456-426614174000",
      "createdAt": "2026-01-14T16:30:00Z",
      "updatedAt": "2026-01-14T16:30:00Z",
      "pickup": {...},
      "delivery": {...},
      "assignee": {
        "uuid": "123e4567-e89b-12d3-a456-426614174000",
        "fullName": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "total": 1
}
```

---

### 5. Get Job Details

**GET** `/jobs/550e8400-e29b-41d4-a716-446655440000`

**Response:**

```json
{
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "jobCode": "JOB-2026-001",
    "jobStatus": "planned",
    "description": "Deliver package to customer in Jakarta",
    "assignedTo": "123e4567-e89b-12d3-a456-426614174000",
    "createdAt": "2026-01-14T16:30:00Z",
    "updatedAt": "2026-01-14T16:30:00Z",
    "pickup": {...},
    "delivery": {...},
    "assignee": {...}
  },
  "source": "cache"
}
```

---

### 6. Start Job

**POST** `/jobs/550e8400-e29b-41d4-a716-446655440000/start`

**Request:**

```json
{
  "lat": -6.215,
  "lng": 106.82
}
```

**Response:**

```json
{
  "message": "Job started successfully",
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "jobCode": "JOB-2026-001",
    "jobStatus": "in_progress",
    "description": "Deliver package to customer in Jakarta",
    "assignedTo": "123e4567-e89b-12d3-a456-426614174000",
    "createdAt": "2026-01-14T16:30:00Z",
    "updatedAt": "2026-01-14T16:31:30Z",
    "pickup": {...},
    "delivery": {...}
  }
}
```

**Redis Keys Created:**

```
key: details_550e8400-e29b-41d4-a716-446655440000
value: {full job details object}

key: currentLoc_550e8400-e29b-41d4-a716-446655440000
value: {
  "lat": -6.2150,
  "lng": 106.8200
}
```

---

### 7. Delete Job

**DELETE** `/jobs/550e8400-e29b-41d4-a716-446655440000`

**Response:**

```json
{
  "message": "Job deleted successfully",
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "jobCode": "JOB-2026-001",
    "jobStatus": "deleted",
    "description": "Deliver package to customer in Jakarta",
    "assignedTo": "123e4567-e89b-12d3-a456-426614174000",
    "createdAt": "2026-01-14T16:30:00Z",
    "updatedAt": "2026-01-14T16:31:00Z"
  }
}
```

---

### 8. Push Location

**POST** `/tracking/push-location`

**Request:**

```json
{
  "jobUuid": "550e8400-e29b-41d4-a716-446655440000",
  "lat": -6.216,
  "lng": 106.822
}
```

**Request (with polyline update - reroute scenario):**

```json
{
  "jobUuid": "550e8400-e29b-41d4-a716-446655440000",
  "lat": -6.216,
  "lng": 106.822,
  "polyline": "enc:{newPolylineDataAfterReroute...}"
}
```

**Note:**

- `polyline` is optional
- When provided, it will:
  - Update polyline in database (Delivery table)
  - Update Redis cache (`details_{jobUuid}`)
  - Update current location Redis (`currentLoc_{jobUuid}`)
  - Broadcast updated polyline via WebSocket to all subscribers

**Response:**

```json
{
  "message": "Location updated successfully",
  "data": {
    "jobUuid": "550e8400-e29b-41d4-a716-446655440000",
    "lat": -6.216,
    "lng": 106.822,
    "polyline": "enc:{wsiFljiiBrB~A...",
    "timestamp": "2026-01-14T16:32:00Z"
  }
}
```

**Redis Key Updated:**

```
key: currentLoc_550e8400-e29b-41d4-a716-446655440000
value: {
  "lat": -6.2160,
  "lng": 106.8220,
  "polyline": "enc:{wsiFljiiBrB~A...",
  "timestamp": "2026-01-14T16:32:00Z"
}

// If polyline provided in request:
key: details_550e8400-e29b-41d4-a716-446655440000
value: {full job details with updated polyline}
```

**WebSocket Event Emitted:**

```
Event: location_update
Room: tracking_{jobUuid}
Data: {
  jobId: "550e8400-e29b-41d4-a716-446655440000",
  location: {
    lat: -6.216,
    lng: 106.822,
    polyline: "enc:{wsiFljiiBrB~A...",
    timestamp: "2026-01-14T16:32:00Z"
  }
}
```

---

### 9. Get Current Location

**GET** `/tracking/550e8400-e29b-41d4-a716-446655440000/location`

**Response:**

```json
{
  "data": {
    "lat": -6.216,
    "lng": 106.822,
    "timestamp": "2026-01-14T16:32:00Z"
  }
}
```

---

## 🗝️ Redis Keys Reference

| Key Pattern             | Value                   | TTL    | Usage                                |
| ----------------------- | ----------------------- | ------ | ------------------------------------ |
| `details_{job_uuid}`    | Full job object         | No TTL | Cache job details saat job di-start  |
| `currentLoc_{job_uuid}` | `{lat, lng, timestamp}` | No TTL | Store current location saat tracking |

---

## 📄 Testing Tools

### 1. Swagger UI

- URL: http://localhost:3000/api
- Langsung test API dari browser

### 2. Postman Collection

- File: `JOB_TRACKING_API.postman_collection.json`
- Import ke Postman dan gunakan

### 3. CURL Commands

- File: `TEST_API_CURL.sh`
- Jalankan: `bash TEST_API_CURL.sh`

### 4. Sample Payloads

- File: `API_SAMPLE_PAYLOADS.json`
- Referensi lengkap semua endpoint

---

## 🚀 Getting Started

### 1. Setup Environment

```bash
cp .env.example .env
# Edit .env dengan credentials Anda
```

### 2. Setup Database

```bash
npx prisma migrate dev --name init
```

### 3. Start Development Server

```bash
npm run start:dev
```

### 4. Access Swagger

```
http://localhost:3000/api
```

---

## 📊 Job Status Flow

```
planned
   ↓
in_progress (saat /jobs/:id/start dipanggil)
   ↓
finished
   ↓
closed

deleted (soft delete - tidak dihitung dalam get all jobs)
```

---

## 🔍 Key Features

✅ **Redis Caching** - Job details dan location di-cache di Redis  
✅ **Real-time Location Tracking** - Push dan retrieve location dari Redis  
✅ **Soft Delete** - Job tidak benar-benar dihapus, hanya status berubah  
✅ **Automatic Relationships** - Pickup & Delivery dibuat otomatis saat job dibuat  
✅ **Redis Health Check** - Status Redis ditampilkan di /health  
✅ **Swagger Documentation** - Semua endpoint terdokumentasi di Swagger

---

## 📧 Support

Untuk pertanyaan atau bug report, silakan buat issue di repository.
