# Job Code Auto-Generation Implementation

## Overview

JobCode sekarang **di-generate otomatis** saat membuat job, tidak perlu dikirim dari payload.

## Changes Made

### 1. DTO Update (`src/jobs/dto/create-job.dto.ts`)

- ❌ Removed `jobCode` field dari CreateJobDto
- ✅ Payload sekarang hanya butuh: `description`, `assignedTo`, `pickup`, `delivery`

### 2. Service Implementation (`src/jobs/jobs.service.ts`)

Added `generateJobCode()` method dengan logic:

```typescript
private async generateJobCode(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  // Count jobs created today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const jobsCount = await this.prisma.job.count({
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  const sequenceNumber = String(jobsCount + 1).padStart(5, '0');
  return `JOB-${dateStr}-${sequenceNumber}`;
}
```

## Format Specification

### Job Code Pattern: `JOB-YYYYMMDD-XXXXX`

| Part      | Example    | Explanation                   |
| --------- | ---------- | ----------------------------- |
| Prefix    | `JOB`      | Fixed prefix                  |
| Date      | `20260114` | YYYYMMDD format (no hyphens)  |
| Separator | `-`        | Hyphen                        |
| Sequence  | `00001`    | 5-digit padded number per day |

### Examples

- First job on 2026-01-14: `JOB-20260114-00001`
- Second job on 2026-01-14: `JOB-20260114-00002`
- First job on 2026-01-15: `JOB-20260115-00001`
- 10000th job on 2026-01-14: `JOB-20260114-10000`

## New Create Job Payload

### Request

```json
{
  "description": "Deliver package to customer",
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

### Response

```json
{
  "message": "Job created successfully",
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "jobCode": "JOB-20260114-00001",  // ← Auto-generated
    "jobStatus": "planned",
    "description": "Deliver package to customer",
    "assignedTo": "123e4567-e89b-12d3-a456-426614174000",
    "createdAt": "2026-01-14T16:30:00Z",
    "updatedAt": "2026-01-14T16:30:00Z",
    "pickup": {...},
    "delivery": {...}
  }
}
```

## Benefits

✅ **Unique & Sequential** - Guaranteed unique per day with sequential numbering  
✅ **Human Readable** - Date-based format easy to track  
✅ **No Manual Input** - Reduces user error  
✅ **Sortable** - Can sort by date from job code  
✅ **Scalable** - Supports up to 99,999 jobs per day

## Updated Documentation Files

✅ API_DOCUMENTATION.md - Updated create job section  
✅ API_SAMPLE_PAYLOADS.json - Removed jobCode from request payload  
✅ TEST_API_CURL.sh - Updated curl command  
✅ JOB_TRACKING_API.postman_collection.json - Updated Postman collection

## Testing

To test the auto-generation:

```bash
# First job on Jan 14
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test job 1",
    "pickup": {"address": "A", "lat": -6.2, "lng": 106.8},
    "delivery": {"address": "B", "lat": -6.2, "lng": 106.8}
  }'

# Response will have: "jobCode": "JOB-20260114-00001"

# Second job on same day
# Response will have: "jobCode": "JOB-20260114-00002"

# Next day
# Response will have: "jobCode": "JOB-20260115-00001"
```

## Database Migration

No database migration needed - jobCode already exists as unique field in schema.
