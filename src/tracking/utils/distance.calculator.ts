import { decode } from '@googlemaps/polyline-codec';

/**
 * Haversine Distance Calculator
 * Menghitung jarak geografis antara 2 koordinat dalam km
 *
 * @param lat1 Latitude titik 1
 * @param lng1 Longitude titik 1
 * @param lat2 Latitude titik 2
 * @param lng2 Longitude titik 2
 * @returns Jarak dalam km
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lng2 - lng1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate perpendicular distance from a point to a line segment
 * Used to find closest point on polyline
 *
 * @param pointLat Current latitude
 * @param pointLng Current longitude
 * @param lat1 Segment start latitude
 * @param lng1 Segment start longitude
 * @param lat2 Segment end latitude
 * @param lng2 Segment end longitude
 * @returns Distance in km
 */
function distancePointToSegment(
  pointLat: number,
  pointLng: number,
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  // Convert to radians
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lng1Rad = (lng1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const lng2Rad = (lng2 * Math.PI) / 180;
  const pointLatRad = (pointLat * Math.PI) / 180;
  const pointLngRad = (pointLng * Math.PI) / 180;

  const dLng21 = lng2Rad - lng1Rad;
  const dLat21 = lat2Rad - lat1Rad;
  const dLng10 = pointLngRad - lng1Rad;
  const dLat10 = pointLatRad - lat1Rad;

  const A = dLat21 * dLat21 + dLng21 * dLng21;

  if (A === 0) {
    // Start and end points are same
    return haversineDistance(pointLat, pointLng, lat1, lng1);
  }

  let t = (dLat10 * dLat21 + dLng10 * dLng21) / A;

  // Clamp t to [0, 1]
  if (t < 0) t = 0;
  if (t > 1) t = 1;

  const closestLat = lat1 + t * (lat2 - lat1);
  const closestLng = lng1 + t * (lng2 - lng1);

  return haversineDistance(pointLat, pointLng, closestLat, closestLng);
}

/**
 * Find nearest point on polyline
 * Returns the segment index and distance to that segment
 *
 * @param currentLat Current driver latitude
 * @param currentLng Current driver longitude
 * @param polylineCoordinates Decoded polyline coordinates array
 * @returns Object dengan segment index dan distance
 */
export function findNearestPointOnPolyline(
  currentLat: number,
  currentLng: number,
  polylineCoordinates: Array<[number, number]>,
): {
  index: number;
  distance: number;
} {
  let minDistance = Infinity;
  let nearestIndex = 0;

  // Loop through each segment
  for (let i = 0; i < polylineCoordinates.length - 1; i++) {
    const [lat1, lng1] = polylineCoordinates[i];
    const [lat2, lng2] = polylineCoordinates[i + 1];

    const distance = distancePointToSegment(
      currentLat,
      currentLng,
      lat1,
      lng1,
      lat2,
      lng2,
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = i;
    }
  }

  return {
    index: nearestIndex,
    distance: minDistance,
  };
}

/**
 * Decode polyline and return array of [lat, lng] coordinates
 *
 * @param polylineEncoded Encoded polyline from Google Maps
 * @returns Array of [latitude, longitude] tuples
 */
export function decodePolyline(
  polylineEncoded: string,
): Array<[number, number]> {
  const decoded = decode(polylineEncoded);
  // Google's decoder returns [lat, lng], we need [lat, lng]
  return decoded as Array<[number, number]>;
}

/**
 * Calculate remaining distance from nearest point to destination
 * Sums up all segment distances from nearest index to the end
 *
 * @param nearestIndex Index dari segment terdekat
 * @param currentLat Current driver latitude
 * @param currentLng Current driver longitude
 * @param polylineCoordinates Decoded polyline coordinates
 * @returns Remaining distance in km
 */
export function calculateRemainingDistance(
  nearestIndex: number,
  currentLat: number,
  currentLng: number,
  polylineCoordinates: Array<[number, number]>,
): number {
  let remainingDistance = 0;

  // Distance from current position to end of nearest segment
  const [lat1, lng1] = polylineCoordinates[nearestIndex];
  const [lat2, lng2] = polylineCoordinates[nearestIndex + 1];

  // Calculate point on segment closest to current position
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lng1Rad = (lng1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const lng2Rad = (lng2 * Math.PI) / 180;
  const currentLatRad = (currentLat * Math.PI) / 180;
  const currentLngRad = (currentLng * Math.PI) / 180;

  const dLng21 = lng2Rad - lng1Rad;
  const dLat21 = lat2Rad - lat1Rad;
  const dLng10 = currentLngRad - lng1Rad;
  const dLat10 = currentLatRad - lat1Rad;

  const A = dLat21 * dLat21 + dLng21 * dLng21;
  let t = (dLat10 * dLat21 + dLng10 * dLng21) / A;

  if (t < 0) t = 0;
  if (t > 1) t = 1;

  const projectedLat = lat1 + t * (lat2 - lat1);
  const projectedLng = lng1 + t * (lng2 - lng1);

  // Distance dari current ke projected point
  remainingDistance += haversineDistance(
    currentLat,
    currentLng,
    projectedLat,
    projectedLng,
  );

  // Distance dari end of segment ke destination
  remainingDistance += haversineDistance(
    projectedLat,
    projectedLng,
    lat2,
    lng2,
  );

  // Sum all segments from nearest_index+1 to end
  for (let i = nearestIndex + 1; i < polylineCoordinates.length - 1; i++) {
    const [prevLat, prevLng] = polylineCoordinates[i];
    const [nextLat, nextLng] = polylineCoordinates[i + 1];
    remainingDistance += haversineDistance(prevLat, prevLng, nextLat, nextLng);
  }

  return remainingDistance;
}

/**
 * Calculate speed in km per minute
 * Based on total distance and estimated duration
 *
 * @param totalDistanceKm Total distance from pickup to delivery
 * @param estimatedDurationMinutes Total estimated duration in minutes
 * @returns Speed in km/minute
 */
export function calculateSpeedPerMinute(
  totalDistanceKm: number,
  estimatedDurationMinutes: number,
): number {
  if (estimatedDurationMinutes === 0) {
    return 0;
  }
  return totalDistanceKm / estimatedDurationMinutes;
}

/**
 * Calculate estimated duration to reach destination
 *
 * @param remainingDistanceKm Remaining distance in km
 * @param speedPerMinute Speed in km/minute
 * @returns Estimated duration in minutes (rounded up)
 */
export function calculateDurationEstimation(
  remainingDistanceKm: number,
  speedPerMinute: number,
): number {
  if (speedPerMinute === 0) {
    return 0;
  }
  const durationMinutes = remainingDistanceKm / speedPerMinute;
  return Math.ceil(durationMinutes);
}

/**
 * Main function to calculate location tracking data
 * Orchestrates all calculations
 *
 * @param currentLat Current driver latitude
 * @param currentLng Current driver longitude
 * @param polylineEncoded Encoded polyline from Google Maps
 * @param totalDistanceKm Total distance from pickup to delivery
 * @param estimatedDurationMinutes Total estimated duration in minutes
 * @returns Object containing remaining distance and duration estimation
 */
export function calculateLocationTracking(
  currentLat: number,
  currentLng: number,
  polylineEncoded: string,
  totalDistanceKm: number,
  estimatedDurationMinutes: number,
): {
  remainingDistanceKm: number;
  durationEstimation: number;
} {
  try {
    // Decode polyline
    const polylineCoordinates = decodePolyline(polylineEncoded);

    // Find nearest point on polyline
    const { index: nearestIndex } = findNearestPointOnPolyline(
      currentLat,
      currentLng,
      polylineCoordinates,
    );

    // Calculate remaining distance
    const remainingDistanceKm = calculateRemainingDistance(
      nearestIndex,
      currentLat,
      currentLng,
      polylineCoordinates,
    );

    // Calculate speed per minute
    const speedPerMinute = calculateSpeedPerMinute(
      totalDistanceKm,
      estimatedDurationMinutes,
    );

    // Calculate duration estimation
    const durationEstimation = calculateDurationEstimation(
      remainingDistanceKm,
      speedPerMinute,
    );

    return {
      remainingDistanceKm: Math.round(remainingDistanceKm * 100) / 100, // Round to 2 decimals
      durationEstimation,
    };
  } catch (error) {
    throw new Error(
      `Error calculating location tracking: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
