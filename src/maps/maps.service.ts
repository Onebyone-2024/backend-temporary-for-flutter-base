import { Injectable, Logger } from '@nestjs/common';

interface GoogleRoute {
  polyline: string;
  distance: number; // in km
  duration: number; // in minutes
  distanceText: string;
  durationText: string;
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
}
