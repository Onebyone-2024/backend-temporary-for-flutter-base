// Import dari file yang sudah ada
const fs = require('fs');
const path = require('path');

// Decode polyline function
function decodePolyline(polylineEncoded) {
  const poly = [];
  let index = 0, lat = 0, lng = 0;
  
  while (index < polylineEncoded.length) {
    let result = 0;
    let shift = 0;
    
    do {
      let b = polylineEncoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (polylineEncoded.charCodeAt(index - 1) - 63 >= 0x20);
    
    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    
    result = 0;
    shift = 0;
    
    do {
      let b = polylineEncoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (polylineEncoded.charCodeAt(index - 1) - 63 >= 0x20);
    
    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    
    poly.push([lat / 1e5, lng / 1e5]);
  }
  
  return poly;
}

// Haversine distance in meters
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c) * 1000; // return in meters
}

// Find minimum distance from point to polyline
function minDistanceToPolyline(lat, lng, polylineCoordinates) {
  let minDistance = Infinity;
  
  for (let i = 0; i < polylineCoordinates.length - 1; i++) {
    const [lat1, lng1] = polylineCoordinates[i];
    const [lat2, lng2] = polylineCoordinates[i + 1];
    
    // Calculate perpendicular distance to this segment
    const d1 = haversineDistance(lat, lng, lat1, lng1);
    const d2 = haversineDistance(lat, lng, lat2, lng2);
    const d = haversineDistance(lat1, lng1, lat2, lng2);
    
    let distance = Math.min(d1, d2);
    
    if (d > 0) {
      const s = ((lat - lat1) * (lat2 - lat1) + (lng - lng1) * (lng2 - lng1)) / (d * d);
      if (s >= 0 && s <= 1) {
        const px = lat1 + s * (lat2 - lat1);
        const py = lng1 + s * (lng2 - lng1);
        distance = Math.min(distance, haversineDistance(lat, lng, px, py));
      }
    }
    
    minDistance = Math.min(minDistance, distance);
  }
  
  return minDistance;
}

// Main analysis
const polyline = 'm{zEcqazRxYjO~m@fZpg@vZzWbI~NvG';
const coordinates = decodePolyline(polyline);

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║           LOCATION REROUTE ANALYSIS                          ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

console.log('📍 Polyline Info:');
console.log(`   Original: ${polyline}`);
console.log(`   Decoded points: ${coordinates.length} points\n`);

// Test data
const correctCoords = [
  { name: 'Correct #1', lat: 1.1205, lng: 104.0488 },
  { name: 'Correct #2', lat: 1.1118, lng: 104.0430 },
  { name: 'Correct #3', lat: 1.1055, lng: 104.0395 }
];

const wrongCoords = [
  { name: 'Wrong #1', lat: 1.1205, lng: 104.0493 },
  { name: 'Wrong #2', lat: 1.1123, lng: 104.0430 },
  { name: 'Wrong #3', lat: 1.1055, lng: 104.0389 }
];

function analyzeCoordinates(label, coords) {
  console.log(`\n${label}`);
  console.log('─'.repeat(65));
  
  coords.forEach((coord, idx) => {
    const distance = minDistanceToPolyline(coord.lat, coord.lng, coordinates);
    const needsReroute = distance > 50;
    const status = needsReroute ? '🔴 REROUTE NEEDED' : '✅ ON-ROUTE';
    
    console.log(`${idx + 1}. ${coord.name.padEnd(15)} (${coord.lat}, ${coord.lng})`);
    console.log(`   Distance from route: ${distance.toFixed(1)}m ${status}\n`);
  });
}

analyzeCoordinates('📍 CORRECT COORDINATES (Should stay on route)', correctCoords);
analyzeCoordinates('⚠️  WRONG COORDINATES (Should trigger reroute)', wrongCoords);

console.log('═'.repeat(65));
console.log('Threshold for reroute: 50 meters\n');
