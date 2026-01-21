/**
 * TEST: Location Tracking Calculation
 *
 * Mendemonstrasikan perhitungan duration estimation dan remaining distance
 * dengan data real dari Google Maps Polyline
 */

import {
  calculateLocationTracking,
  decodePolyline,
  calculateSpeedPerMinute,
  calculateDurationEstimation,
  haversineDistance,
} from './distance.calculator';

/**
 * Sample data dari Jakarta to Bandung
 * Approximate: 3 hours, ~180 km
 */
const SAMPLE_POLYLINE = '_p~iF~ps|U_ulLnnqC_mqNvxq`@'; // Simplified polyline
const TOTAL_DISTANCE_KM = 180;
const ESTIMATED_DURATION_MINUTES = 180; // 3 hours

/**
 * Test Case 1: Calculate from start position
 * Driver di point awal rute
 */
export function testCase1_StartPosition() {
  console.log('\n=== Test Case 1: Start Position ===');

  // Current position: approximately at start
  const currentLat = -6.2088;
  const currentLng = 106.8456;

  try {
    const result = calculateLocationTracking(
      currentLat,
      currentLng,
      SAMPLE_POLYLINE,
      TOTAL_DISTANCE_KM,
      ESTIMATED_DURATION_MINUTES,
    );

    console.log('Result:', result);
    console.log(
      `Remaining: ${result.remainingDistanceKm}km, ETA: ${result.durationEstimation}min`,
    );
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Test Case 2: Calculate from middle position
 * Driver sudah di tengah perjalanan
 */
export function testCase2_MiddlePosition() {
  console.log('\n=== Test Case 2: Middle Position ===');

  // Current position: approximately halfway
  const currentLat = -6.215;
  const currentLng = 106.88;

  try {
    const result = calculateLocationTracking(
      currentLat,
      currentLng,
      SAMPLE_POLYLINE,
      TOTAL_DISTANCE_KM,
      ESTIMATED_DURATION_MINUTES,
    );

    console.log('Result:', result);
    console.log(
      `Remaining: ${result.remainingDistanceKm}km, ETA: ${result.durationEstimation}min`,
    );
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Test Case 3: Calculate near destination
 * Driver hampir sampai
 */
export function testCase3_NearDestination() {
  console.log('\n=== Test Case 3: Near Destination ===');

  // Current position: approximately near end
  const currentLat = -6.22;
  const currentLng = 106.85;

  try {
    const result = calculateLocationTracking(
      currentLat,
      currentLng,
      SAMPLE_POLYLINE,
      TOTAL_DISTANCE_KM,
      ESTIMATED_DURATION_MINUTES,
    );

    console.log('Result:', result);
    console.log(
      `Remaining: ${result.remainingDistanceKm}km, ETA: ${result.durationEstimation}min`,
    );
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Test Case 4: Decode polyline
 * Verify decoding works correctly
 */
export function testCase4_DecodePolyline() {
  console.log('\n=== Test Case 4: Decode Polyline ===');

  try {
    const coordinates = decodePolyline(SAMPLE_POLYLINE);
    console.log('Decoded coordinates:', coordinates);
    console.log(`Number of points: ${coordinates.length}`);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Test Case 5: Haversine distance
 * Verify distance calculation is correct
 */
export function testCase5_HaversineDistance() {
  console.log('\n=== Test Case 5: Haversine Distance ===');

  // Jakarta coordinates
  const lat1 = -6.2088;
  const lng1 = 106.8456;

  // Bandung coordinates (approximately 180km away)
  const lat2 = -6.9147;
  const lng2 = 107.6098;

  const distance = haversineDistance(lat1, lng1, lat2, lng2);
  console.log(`Distance Jakarta to Bandung: ${distance.toFixed(2)}km`);
  console.log('Expected: ~180km');
}

/**
 * Test Case 6: Speed calculation
 * Verify speed assumption calculation
 */
export function testCase6_SpeedCalculation() {
  console.log('\n=== Test Case 6: Speed Calculation ===');

  const totalDistance = 180; // km
  const totalDuration = 180; // minutes (3 hours)

  const speedPerMinute = calculateSpeedPerMinute(totalDistance, totalDuration);
  const speedPerHour = speedPerMinute * 60;

  console.log(`Total distance: ${totalDistance}km`);
  console.log(`Total duration: ${totalDuration}min`);
  console.log(
    `Speed: ${speedPerMinute.toFixed(3)}km/min = ${speedPerHour.toFixed(1)}km/h`,
  );
}

/**
 * Test Case 7: Duration estimation from remaining distance
 * Verify duration calculation logic
 */
export function testCase7_DurationEstimation() {
  console.log('\n=== Test Case 7: Duration Estimation ===');

  const remainingDistance = 90; // km (halfway)
  const totalDistance = 180;
  const totalDuration = 180;

  const speedPerMinute = calculateSpeedPerMinute(totalDistance, totalDuration);
  const durationEstimation = calculateDurationEstimation(
    remainingDistance,
    speedPerMinute,
  );

  console.log(`Remaining distance: ${remainingDistance}km`);
  console.log(`Speed: ${(speedPerMinute * 60).toFixed(1)}km/h`);
  console.log(`Estimated duration: ${durationEstimation}min`);
  console.log('Expected: ~90min');
}

/**
 * Run all tests
 */
export function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   LOCATION TRACKING CALCULATION TEST SUITE                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  testCase1_StartPosition();
  testCase2_MiddlePosition();
  testCase3_NearDestination();
  testCase4_DecodePolyline();
  testCase5_HaversineDistance();
  testCase6_SpeedCalculation();
  testCase7_DurationEstimation();

  console.log(
    '\n╔════════════════════════════════════════════════════════════╗',
  );
  console.log('║   TESTS COMPLETED                                          ║');
  console.log(
    '╚════════════════════════════════════════════════════════════╝\n',
  );
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}
