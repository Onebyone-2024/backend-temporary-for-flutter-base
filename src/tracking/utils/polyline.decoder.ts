/**
 * Polyline Decoder & Off-Route Detection
 * Decodes Google encoded polylines and calculates distance from current position to polyline
 */

/**
 * Decode Google encoded polyline to lat/lng coordinates
 * @param polylineEncoded - Google encoded polyline string
 * @returns Array of [lat, lng] tuples
 */
export function decodePolyline(
  polylineEncoded: string,
): Array<[number, number]> {
  const coordinates: Array<[number, number]> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < polylineEncoded.length) {
    let result = 0;
    let shift = 0;

    // Decode latitude
    let b = 0;
    do {
      b = polylineEncoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    // Decode longitude
    result = 0;
    shift = 0;
    do {
      b = polylineEncoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push([lat / 1e5, lng / 1e5]);
  }

  return coordinates;
}

/**
 * Haversine formula: Calculate distance between two points on Earth
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate perpendicular distance from point to line segment
 * Uses projection formula to find the closest point on the line segment
 */
function distancePointToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) param = dot / lenSq;

  let xx: number, yy: number;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  // Return distance in km
  return haversineDistance(px, py, xx, yy);
}

/**
 * Check if driver is off-route
 * Compares current location to polyline and returns distance
 *
 * @param currentLat - Current latitude
 * @param currentLng - Current longitude
 * @param polylineEncoded - Google encoded polyline
 * @param thresholdMeters - Distance threshold (default 100m)
 * @returns Object with isOffRoute boolean and distance from polyline in meters
 */
export function isOffRoute(
  currentLat: number,
  currentLng: number,
  polylineEncoded: string,
  thresholdMeters: number = 100,
): { isOffRoute: boolean; distanceFromPolyline: number } {
  try {
    // Decode polyline locally (no API call needed)
    const coordinates = decodePolyline(polylineEncoded);

    if (coordinates.length < 2) {
      return { isOffRoute: false, distanceFromPolyline: 0 };
    }

    // Find nearest point on polyline
    let minDistance = Infinity;

    for (let i = 0; i < coordinates.length - 1; i++) {
      const [lat1, lng1] = coordinates[i];
      const [lat2, lng2] = coordinates[i + 1];

      // Calculate perpendicular distance to segment
      const distance = distancePointToSegment(
        currentLat,
        currentLng,
        lat1,
        lng1,
        lat2,
        lng2,
      );

      minDistance = Math.min(minDistance, distance);

      // Early exit if within threshold
      if (minDistance * 1000 < thresholdMeters) {
        return { isOffRoute: false, distanceFromPolyline: minDistance * 1000 };
      }
    }

    // Convert from km to meters
    const distanceInMeters = minDistance * 1000;

    return {
      isOffRoute: distanceInMeters > thresholdMeters,
      distanceFromPolyline: distanceInMeters,
    };
  } catch (error) {
    console.error('Error checking off-route:', error);
    return { isOffRoute: false, distanceFromPolyline: 0 };
  }
}
