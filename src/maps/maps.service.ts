import { Injectable, Logger } from '@nestjs/common';

interface GoogleRoute {
  polyline: string;
  distance: number; // in km
  duration: number; // in minutes
  distanceText: string;
  durationText: string;
}

export interface SimpleRoute {
  name: string; // Route A, Route B, Route C, etc.
  distance: string; // e.g. "6.0 km"
  duration: string; // e.g. "13 mins"
  polyline: string; // Encoded polyline
}

export interface SimpleDirectionsResponse {
  details: {
    from: {
      address: string;
      lat: number;
      lng: number;
    };
    to: {
      address: string;
      lat: number;
      lng: number;
    };
  };
  routes: SimpleRoute[];
}

// Google's full response type (kept for internal use)
interface GoogleDirectionsResponse {
  routes: Array<{
    bounds: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      end_address: string;
      end_location: { lat: number; lng: number };
      start_address: string;
      start_location: { lat: number; lng: number };
      steps: Array<{
        distance: { text: string; value: number };
        duration: { text: string; value: number };
        end_location: { lat: number; lng: number };
        html_instructions: string;
        maneuver?: string;
        polyline: { points: string };
        start_location: { lat: number; lng: number };
        travel_mode: string;
      }>;
      via_waypoints: Array<{ lat: number; lng: number }>;
    }>;
    overview_polyline: { points: string };
    summary: string;
    warnings: string[];
    waypoint_order: number[];
  }>;
  geocoded_waypoints?: Array<{
    geocoder_status: string;
    partial_match?: boolean;
    place_id: string;
    types: string[];
  }>;
  status: string;
}

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);
  private readonly googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

  /**
   * Get reroute from current position to destination using Google Directions API
   *
   * @param startLat - Starting latitude
   * @param startLng - Starting longitude
   * @param destLat - Destination latitude
   * @param destLng - Destination longitude
   * @returns Object containing new polyline, distance, and duration
   * @throws Error if API call fails or no route found
   */
  async getReroute(
    startLat: number,
    startLng: number,
    destLat: number,
    destLng: number,
  ): Promise<GoogleRoute> {
    if (!this.googleApiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY environment variable not set');
    }

    const url = 'https://maps.googleapis.com/maps/api/directions/json';

    const params = new URLSearchParams({
      origin: `${startLat},${startLng}`,
      destination: `${destLat},${destLng}`,
      key: this.googleApiKey,
    });

    try {
      this.logger.log(
        `📍 Requesting reroute from [${startLat},${startLng}] to [${destLat},${destLng}]`,
      );

      const response = await fetch(`${url}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(
          `Google Maps API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      // Check if API returned an error
      if (data.status !== 'OK') {
        throw new Error(
          `Google Maps API error: ${data.status} - ${data.error_message || ''}`,
        );
      }

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found between start and destination');
      }

      const route = data.routes[0];
      const leg = route.legs[0];

      const result: GoogleRoute = {
        polyline: route.overview_polyline.points,
        distance: leg.distance.value / 1000, // Convert meters to km
        duration: Math.ceil(leg.duration.value / 60), // Convert seconds to minutes
        distanceText: leg.distance.text,
        durationText: leg.duration.text,
      };

      this.logger.log(
        `✓ Reroute obtained: ${result.distanceText} (${result.durationText})`,
      );

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Reroute API call failed: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Check if Google Maps API key is configured
   */
  isConfigured(): boolean {
    return !!this.googleApiKey;
  }

  /**
   * Get simplified directions data from Google Directions API
   * Returns simplified response with details and routes (1-3 alternatives)
   *
   * @param pickupLat - Pickup latitude
   * @param pickupLng - Pickup longitude
   * @param deliveryLat - Delivery latitude
   * @param deliveryLng - Delivery longitude
   * @param alternatives - Whether to return alternative routes (default: true for 1-3 routes)
   * @returns Simplified directions response
   * @throws Error if API call fails
   */
  async getDirections(
    pickupLat: number,
    pickupLng: number,
    deliveryLat: number,
    deliveryLng: number,
    alternatives: boolean = true,
  ): Promise<SimpleDirectionsResponse> {
    if (!this.googleApiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY environment variable not set');
    }

    const url = 'https://maps.googleapis.com/maps/api/directions/json';

    const params = new URLSearchParams({
      origin: `${pickupLat},${pickupLng}`,
      destination: `${deliveryLat},${deliveryLng}`,
      mode: 'driving',
      alternatives: alternatives ? 'true' : 'false',
      key: this.googleApiKey,
    });

    try {
      this.logger.log(
        `📍 Requesting directions from [${pickupLat},${pickupLng}] to [${deliveryLat},${deliveryLng}]`,
      );

      const response = await fetch(`${url}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(
          `Google Maps API error: ${response.status} ${response.statusText}`,
        );
      }

      const data: GoogleDirectionsResponse = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${data.status}`);
      }

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found between pickup and delivery');
      }

      // Transform Google response to simplified format
      const routeNames = ['Route A', 'Route B', 'Route C'];
      const simplifiedRoutes: SimpleRoute[] = data.routes.map(
        (route, index) => ({
          name: routeNames[index] || `Route ${String.fromCharCode(65 + index)}`,
          distance: route.legs[0].distance.text,
          duration: route.legs[0].duration.text,
          polyline: route.overview_polyline.points,
        }),
      );

      const response_data: SimpleDirectionsResponse = {
        details: {
          from: {
            address: data.routes[0].legs[0].start_address,
            lat: data.routes[0].legs[0].start_location.lat,
            lng: data.routes[0].legs[0].start_location.lng,
          },
          to: {
            address: data.routes[0].legs[0].end_address,
            lat: data.routes[0].legs[0].end_location.lat,
            lng: data.routes[0].legs[0].end_location.lng,
          },
        },
        routes: simplifiedRoutes,
      };

      this.logger.log(
        `✓ Directions obtained: ${data.routes.length} route(s) found`,
      );

      return response_data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Directions API call failed: ${errorMessage}`);
      throw error;
    }
  }
}
