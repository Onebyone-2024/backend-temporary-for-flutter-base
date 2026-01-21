## Off-Route Detection & Negative Flow Implementation

### Overview

Implementasi negative flow untuk mendeteksi ketika driver menyimpang dari rute (off-route) dan secara otomatis melakukan rerouting menggunakan Google Maps API.

---

## Architecture Flow

```
Push Location (lat, lng, isOffRoute?)
     ↓
STEP 1: Get current polyline from Redis
     ↓
STEP 2: Check if off-route FLAG set & distance to polyline > 100m?
     ↓
   ┌─── YES → Check throttle (last reroute < 60s?)
   │           ↓
   │         NO → Call Google Directions API
   │           ↓
   │         Get new polyline + distance + duration
   │           ↓
   │         Log history with timestamp & reason
   │           ↓
   │         Update Redis & Database
   │           ↓
   │         Set rerouted = true
   │           ↓
   └─→ Calculate remaining distance & duration
     ↓
   Update Redis currentLoc
     ↓
   Broadcast WebSocket with polylineLog
```

---

## Files Modified/Created

### 1. **src/tracking/utils/polyline.decoder.ts** (NEW)

Utility functions untuk decode Google polyline dan detect off-route.

**Exported Functions:**

- `decodePolyline(polylineEncoded)` - Decode Google encoded polyline to coordinates
- `isOffRoute(lat, lng, polylineEncoded, threshold)` - Check if position is off-route
- `haversineDistance(lat1, lng1, lat2, lng2)` - Calculate distance between coordinates

**Key Features:**

- No API calls (local computation only)
- Early exit optimization for performance
- Accurate perpendicular distance calculation

### 2. **src/maps/maps.service.ts** (NEW)

Service untuk Google Maps Directions API integration.

**Main Method:**

```typescript
async getReroute(startLat, startLng, destLat, destLng): Promise<GoogleRoute>
```

**Returns:**

```typescript
{
  polyline: string; // Encoded polyline from Google
  distance: number; // Distance in km
  duration: number; // Duration in minutes
  distanceText: string; // Human readable (e.g., "5.2 km")
  durationText: string; // Human readable (e.g., "12 mins")
}
```

### 3. **src/maps/maps.module.ts** (NEW)

NestJS module untuk MapsService.

### 4. **src/tracking/dto/push-location.dto.ts** (UPDATED)

Updated dengan PolylineLogEntry dan isOffRoute field.

```typescript
export class PolylineLogEntry {
  polyline: string; // Encoded polyline
  timestamp: string; // ISO timestamp
  reason: 'initial' | 'reroute' | 'off_route';
  distanceFromPreviousRoute?: number; // Meters (for off_route)
}

export class PushLocationDto {
  jobUuid: string;
  lat: number;
  lng: number;
  polyline?: string; // Explicit polyline update
  isOffRoute?: boolean; // Flag: true = off-route detected
}
```

### 5. **src/tracking/tracking.service.ts** (UPDATED)

Completely refactored pushLocation() dengan 8 steps:

**STEP 1:** Get current polyline from Redis  
**STEP 2:** Check off-route flag & distance  
**STEP 3:** Hit Google API if truly off-route (with throttling)  
**STEP 4:** Log history with reason & distance  
**STEP 5:** Update Redis & Database  
**STEP 6:** Calculate new distance/duration  
**STEP 7:** Update Redis currentLoc  
**STEP 8:** Broadcast WebSocket

### 6. **src/tracking/tracking.module.ts** (UPDATED)

Added MapsModule to imports.

### 7. **src/app.module.ts** (UPDATED)

Added MapsModule to global imports.

---

## API Request Example

### Normal Push Location (Positive Flow)

```bash
POST /api/tracking/push-location
Content-Type: application/json

{
  "jobUuid": "job-123",
  "lat": 10.5,
  "lng": 20.3
}
```

### Off-Route Detection (Negative Flow)

```bash
POST /api/tracking/push-location
Content-Type: application/json

{
  "jobUuid": "job-123",
  "lat": 10.5,
  "lng": 20.3,
  "isOffRoute": true
}
```

### Explicit Reroute (Positive Flow - Manual)

```bash
POST /api/tracking/push-location
Content-Type: application/json

{
  "jobUuid": "job-123",
  "lat": 10.5,
  "lng": 20.3,
  "polyline": "enc:{new_polyline_encoded_string}"
}
```

---

## API Response Example (Off-Route with Reroute)

```json
{
  "message": "Location updated successfully",
  "data": {
    "lat": 10.5,
    "lng": 20.3,
    "polyline": "enc:{new_polyline_after_reroute}",
    "polylineLog": [
      {
        "polyline": "enc:{new_polyline}",
        "timestamp": "2026-01-21T10:30:45.123Z",
        "reason": "off_route",
        "distanceFromPreviousRoute": 150.5
      },
      {
        "polyline": "enc:{initial_polyline}",
        "timestamp": "2026-01-21T10:00:00.000Z",
        "reason": "initial"
      }
    ],
    "timestamp": "2026-01-21T10:30:45.123Z",
    "remaining_distance_km": 4.8,
    "duration_estimation": 11,
    "rerouted": true,
    "distanceFromRoute": 150.5
  },
  "offRoute": true,
  "rerouted": true
}
```

---

## Redis Data Structure

### currentLoc\_{jobId}

```json
{
  "lat": 10.5,
  "lng": 20.3,
  "polyline": "enc:{...}",
  "polylineLog": [...],
  "timestamp": "2026-01-21T10:30:45.123Z",
  "remaining_distance_km": 4.8,
  "duration_estimation": 11,
  "rerouted": true,
  "distanceFromRoute": 150.5
}
```

### details\_{jobId}

```json
{
  "delivery": {
    "polyline": "enc:{current_polyline}",
    "polylineLog": [...],
    "distanceKm": 5.2,
    "estimateDuration": 12,
    "lat": 10.6,
    "lng": 20.4
  }
}
```

### lastReroute\_{jobId}

- Value: timestamp in milliseconds
- Purpose: Throttle reroute requests (max 1 per 60 seconds)

---

## Throttling Logic

Untuk mencegah spam API calls, implementasi throttling:

```
if (lastReroute && now - lastReroute < 60000) {
  // Ignore reroute, continue with old polyline
  // Log: "Reroute throttled (N seconds since last)"
} else {
  // Perform reroute
  // Set lastReroute = now
}
```

**Benefit:**

- Hemat API quota Google Maps
- Reduce latency
- Prevent duplicate routes

---

## Environment Variables Required

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Add to your `.env` file. API key dibutuhkan untuk:

- Google Directions API
- polyline encoding/decoding

---

## WebSocket Broadcast Event

Event: `location_update`

```typescript
{
  "jobId": "job-123",
  "location": {
    // ... location data with polylineLog
  },
  "offRoute": true,
  "polylineUpdated": true
}
```

**Frontend menggunakan:**

```typescript
socket.on('location_update', (data) => {
  if (data.polylineUpdated) {
    // Update map with new polyline
    showNewPolyline(data.location.polyline);

    // Show history
    data.location.polylineLog.forEach((log) => {
      console.log(`${log.timestamp}: ${log.reason}`);
    });
  }
});
```

---

## Performance Considerations

1. **Polyline Decoding (Local)**
   - No API calls
   - O(n) complexity per character in polyline
   - Cached hasil dalam distance calculator

2. **Google Directions API (Remote)**
   - Only called when truly off-route
   - Throttled to max 1 per 60 seconds
   - Async, non-blocking

3. **Redis Updates**
   - Very fast, in-memory
   - No blocking operations

4. **Distance Calculation**
   - Haversine formula (accurate)
   - Early exit optimization

---

## Error Handling

```typescript
// If Google API fails
try {
  newRoute = await this.mapsService.getReroute(...);
} catch (error) {
  // Log error
  logger.error(`Reroute failed: ${error.message}`);

  // Continue with old polyline
  // Driver still has valid route
  // Frontend shows warning to user
}
```

**Resilient:** Sistem tetap berfungsi jika Google API down.

---

## Testing

### Test Case 1: Normal Flow

- Push location dengan polyline
- Tidak ada flag isOffRoute
- Expect: Normal distance calculation

### Test Case 2: Off-Route Detection

- Push location 150m dari polyline
- Set isOffRoute = true
- Expect: Google API called, new polyline returned

### Test Case 3: Throttling

- Push location off-route
- Wait < 60s
- Push location off-route lagi
- Expect: Second request throttled, old polyline used

### Test Case 4: API Failure

- Mock Google API to throw error
- Push location off-route
- Expect: Error logged, old polyline still used

---

## Future Enhancements

1. **Smart Threshold**
   - Adjust 100m threshold berdasarkan speed
   - Faster = higher threshold

2. **Multiple Route Options**
   - Return 3 alternative routes dari Google
   - Let frontend choose best

3. **Polyline Comparison**
   - Deduplicate same polyline
   - Store only changes

4. **Analytics**
   - Track off-route frequency
   - Identify problem areas
   - Optimize route suggestions

5. **Predictive Rerouting**
   - Detect deviation pattern
   - Proactive reroute before driver is too far
