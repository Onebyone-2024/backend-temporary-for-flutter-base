import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { TrackingService } from '../tracking/tracking.service';
import {
  StartSimulationDto,
  SimulateOffRouteDto,
  SimulateCustomRouteDto,
  SimulateThrottledRerouteDto,
} from './dto/start-simulation.dto';

// Polyline encoding function (Google Polyline Algorithm)
function encodePolyline(points: Array<{ lat: number; lng: number }>): string {
  let encoded = '';
  let prevLat = 0;
  let prevLng = 0;

  for (const point of points) {
    const lat = point.lat;
    const lng = point.lng;

    const dlat = Math.round((lat - prevLat) * 1e5);
    const dlng = Math.round((lng - prevLng) * 1e5);

    encoded += encodeValue(dlat) + encodeValue(dlng);

    prevLat = lat;
    prevLng = lng;
  }

  return encoded;
}

function encodeValue(value: number): string {
  let result = '';
  value = value << 1;
  if (value < 0) {
    value = ~value;
  }

  while (value >= 0x20) {
    const chunk = (value & 0x1f) | 0x20;
    result += String.fromCharCode(chunk + 63);
    value >>= 5;
  }

  result += String.fromCharCode(value + 63);
  return result;
}

// Dummy data untuk simulasi
const DUMMY_DATA = {
  description: 'Deliver package to customer',
  assignedTo: 'fbcb4bb2-43da-40a2-ad81-e5187c2155ab',
  pickup: {
    address:
      'Jl. Ahmad Yani, Tlk. Tering, Kec. Batam Kota, Kota Batam, Kepulauan Riau 29444, Indonesia',
    lat: 1.1258311,
    lng: 104.0515445,
  },
  delivery: {
    address:
      'K Square Mall, Jl. Sudirman 2F-25, Sukajadi, Kec. Batam Kota, Kota Batam, Kepulauan Riau 29444, Indonesia',
    lat: 1.1009878,
    lng: 104.037103,
    polyline: '', // Will be generated from route coordinates
    distanceKm: 5.2,
    estimateDuration: 15,
    eta: new Date(new Date().getTime() + 15 * 60000), // 15 menit dari sekarang
    etd: new Date(new Date().getTime() + 30 * 60000), // 30 menit dari sekarang
  },
};

// Koordinat rute simulasi Batam
const ROUTE_COORDINATES = [
  {
    name: 'Pickup Point (Jl. Ahmad Yani)',
    lat: 1.1258311,
    lng: 104.0515445,
  },
  {
    name: 'Simpang Frengky',
    lat: 1.121542,
    lng: 104.048921,
  },
  {
    name: 'Simpang Kara',
    lat: 1.114022,
    lng: 104.044561,
  },
  {
    name: 'Simpang Kabil (Kepri Mall)',
    lat: 1.107531,
    lng: 104.040122,
  },
  {
    name: 'Jl. Sudirman (Flyover Laluan Madani)',
    lat: 1.10355,
    lng: 104.0385,
  },
  {
    name: 'Delivery Point (K Square Mall)',
    lat: 1.1009878,
    lng: 104.037103,
  },
];

// Generate polyline from route coordinates
DUMMY_DATA.delivery.polyline = encodePolyline(ROUTE_COORDINATES);

// Helper function: Calculate deviated coordinates
function getDeviatedCoordinate(
  lat: number,
  lng: number,
  deviationMeters: number,
): { lat: number; lng: number } {
  // Random deviation direction
  const angle = Math.random() * Math.PI * 2;
  const deviationKm = deviationMeters / 1000;

  // Approximate: 1 degree ≈ 111 km
  const latOffset = (deviationKm / 111) * Math.cos(angle);
  const lngOffset =
    ((deviationKm / 111) * Math.sin(angle)) / Math.cos((lat * Math.PI) / 180);

  return {
    lat: lat + latOffset,
    lng: lng + lngOffset,
  };
}

@Injectable()
export class SimulationService {
  private activeSimulations: Map<string, NodeJS.Timeout> = new Map();
  private readonly logger = new Logger(SimulationService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly trackingService: TrackingService,
  ) {}

  async createSimulationJob() {
    try {
      // Fetch driver user from DB by email
      const driver = await this.prismaService.user.findUnique({
        where: { email: 'driver@example.com' },
      });

      if (!driver) {
        this.logger.warn('Driver user with email driver@example.com not found');
        return {
          success: false,
          message: 'Driver user with email driver@example.com not found',
        };
      }

      // Buat job dengan dummy data yang sudah fixed
      const job = await this.prismaService.job.create({
        data: {
          jobCode: `SIM-${Date.now()}`,
          description: DUMMY_DATA.description,
          jobStatus: 'planned',
          assignedTo: driver.uuid,
          pickup: {
            create: {
              lat: DUMMY_DATA.pickup.lat,
              lng: DUMMY_DATA.pickup.lng,
              address: DUMMY_DATA.pickup.address,
            },
          },
          delivery: {
            create: {
              lat: DUMMY_DATA.delivery.lat,
              lng: DUMMY_DATA.delivery.lng,
              address: DUMMY_DATA.delivery.address,
              polyline: DUMMY_DATA.delivery.polyline,
              distanceKm: DUMMY_DATA.delivery.distanceKm,
              estimateDuration: DUMMY_DATA.delivery.estimateDuration,
              eta: DUMMY_DATA.delivery.eta,
              etd: DUMMY_DATA.delivery.etd,
            },
          },
        },
        include: {
          pickup: true,
          delivery: true,
        },
      });

      this.logger.log(`✓ Simulation job created: ${job.uuid}`);
      return {
        success: true,
        message: 'Simulation job created successfully with dummy data',
        jobId: job.uuid,
        job,
      };
    } catch (error) {
      this.logger.error(
        `✗ Failed to create simulation job: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  async startSimulation(jobId: string, dto: StartSimulationDto) {
    try {
      // Validasi job exists
      const job = await this.prismaService.job.findUnique({
        where: { uuid: jobId },
        include: { pickup: true, delivery: true, assignee: true },
      });

      if (!job) {
        this.logger.warn(`Job not found: ${jobId}`);
        return {
          success: false,
          message: 'Job not found',
        };
      }

      // Cache job details in Redis (details_{jobUuid})
      const detailsKey = `details_${jobId}`;
      await this.redisService.setJson(detailsKey, job);
      this.logger.log(`✓ Cached job details: ${detailsKey}`);

      // Initialize currentLoc with first coordinate (pickup point)
      const initialCoord = ROUTE_COORDINATES[0];
      const currentLocKey = `currentLoc_${jobId}`;
      const initialLocation = {
        lat: initialCoord.lat,
        lng: initialCoord.lng,
        polyline: job.delivery?.polyline || 'Empty',
        timestamp: new Date().toISOString(),
        // Initial estimation: full distance & duration
        duration_estimation: job.delivery?.estimateDuration || 0,
        remaining_distance_km: job.delivery?.distanceKm || 0,
      };
      await this.redisService.setJson(currentLocKey, initialLocation);
      this.logger.log(
        `✓ Initialized currentLoc: ${currentLocKey} - ${initialCoord.name}`,
      );

      // Update job status to IN_PROGRESS
      await this.prismaService.job.update({
        where: { uuid: jobId },
        data: { jobStatus: 'in_progress' },
      });

      // Stop any existing simulation for this job
      if (this.activeSimulations.has(jobId)) {
        clearInterval(this.activeSimulations.get(jobId));
        this.logger.log(`Stopped previous simulation for job: ${jobId}`);
      }

      // Get polyline from job delivery
      const polyline = job.delivery?.polyline || 'Empty';

      // Start pushing locations
      let coordinateIndex = 0;
      const intervalDuration = (dto.intervalSeconds || 3) * 1000;

      const interval = setInterval(async () => {
        try {
          if (coordinateIndex < ROUTE_COORDINATES.length) {
            const coord = ROUTE_COORDINATES[coordinateIndex];

            // Push location update via WebSocket
            const result = await this.trackingService.pushLocationToSocket(
              jobId,
              {
                lat: coord.lat,
                lng: coord.lng,
                timestamp: new Date().toISOString(),
                polyline,
              },
            );

            this.logger.debug(
              `📍 [${jobId}] Location ${coordinateIndex + 1}/${ROUTE_COORDINATES.length}: ${coord.name}`,
            );

            // Check if arrived at destination
            if (result.arrived) {
              this.logger.log(
                `🎯 [${jobId}] Simulation auto-finishing - driver has arrived at destination`,
              );
              clearInterval(interval);
              this.activeSimulations.delete(jobId);

              // Finish the job
              await this.prismaService.job.update({
                where: { uuid: jobId },
                data: { jobStatus: 'finished' },
              });

              this.logger.log(
                `✓ [${jobId}] Simulation completed - Job finished!`,
              );
              return;
            }

            coordinateIndex++;
          } else {
            // Selesai - finish job (backup in case arrival detection fails)
            clearInterval(interval);
            this.activeSimulations.delete(jobId);

            await this.prismaService.job.update({
              where: { uuid: jobId },
              data: { jobStatus: 'finished' },
            });

            this.logger.log(
              `✓ [${jobId}] Simulation completed - All coordinates pushed!`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Error during simulation tick: ${error.message}`,
            error,
          );
        }
      }, intervalDuration);

      this.activeSimulations.set(jobId, interval);

      this.logger.log(
        `✓ Simulation started for job ${jobId} - interval ${dto.intervalSeconds || 3}s`,
      );

      return {
        success: true,
        message: `Simulation started - pushing locations every ${dto.intervalSeconds || 3} seconds`,
        jobId,
        totalCoordinates: ROUTE_COORDINATES.length,
        intervalSeconds: dto.intervalSeconds || 3,
      };
    } catch (error) {
      this.logger.error(
        `✗ Failed to start simulation: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  async stopSimulation(jobId: string) {
    try {
      if (this.activeSimulations.has(jobId)) {
        clearInterval(this.activeSimulations.get(jobId));
        this.activeSimulations.delete(jobId);

        // Update job status to FINISHED
        await this.prismaService.job.update({
          where: { uuid: jobId },
          data: { jobStatus: 'finished' },
        });

        this.logger.log(`✓ Simulation stopped: ${jobId}`);
        return {
          success: true,
          message: 'Simulation stopped',
          jobId,
        };
      }

      this.logger.warn(`No active simulation for job: ${jobId}`);
      return {
        success: false,
        message: 'No active simulation for this job',
      };
    } catch (error) {
      this.logger.error(`✗ Failed to stop simulation: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Simulate off-route scenario
   * Driver deviates from original route at specified point and continues deviating
   */
  async simulateOffRoute(jobId: string, dto: SimulateOffRouteDto) {
    try {
      const job = await this.prismaService.job.findUnique({
        where: { uuid: jobId },
        include: { pickup: true, delivery: true, assignee: true },
      });

      if (!job) {
        return { success: false, message: 'Job not found' };
      }

      // Cache job details in Redis
      const detailsKey = `details_${jobId}`;
      await this.redisService.setJson(detailsKey, job);

      // Stop existing simulation
      if (this.activeSimulations.has(jobId)) {
        clearInterval(this.activeSimulations.get(jobId));
      }

      // Update job status
      await this.prismaService.job.update({
        where: { uuid: jobId },
        data: { jobStatus: 'in_progress' },
      });

      let coordinateIndex = 0;
      const intervalDuration = (dto.intervalSeconds || 3) * 1000;
      const deviateAtIndex = dto.deviateAtIndex || 2;
      const deviationMeters = dto.deviationMeters || 150;
      let isDeviated = false;
      let lastRerouteIndex = -1;

      const interval = setInterval(async () => {
        try {
          if (coordinateIndex < ROUTE_COORDINATES.length) {
            const coord = ROUTE_COORDINATES[coordinateIndex];

            // Start deviation after specified index
            if (coordinateIndex >= deviateAtIndex && !isDeviated) {
              isDeviated = true;
              this.logger.warn(
                `🚨 [${jobId}] OFF-ROUTE SIMULATION: Deviating at index ${coordinateIndex}`,
              );
            }

            // Apply deviation to coordinates
            if (isDeviated) {
              const deviated = getDeviatedCoordinate(
                coord.lat,
                coord.lng,
                deviationMeters,
              );

              // Check if we should trigger off-route flag (only once per few updates)
              if (
                coordinateIndex - lastRerouteIndex >= 2 &&
                coordinateIndex > deviateAtIndex
              ) {
                // Push with isOffRoute flag
                await this.trackingService.pushLocation({
                  jobUuid: jobId,
                  lat: deviated.lat,
                  lng: deviated.lng,
                  isOffRoute: true,
                });

                lastRerouteIndex = coordinateIndex;
                this.logger.log(
                  `📍 [${jobId}] Off-route location with reroute flag at index ${coordinateIndex}`,
                );
              } else {
                // Push normal location
                await this.trackingService.pushLocation({
                  jobUuid: jobId,
                  lat: deviated.lat,
                  lng: deviated.lng,
                });

                this.logger.debug(
                  `📍 [${jobId}] Deviated location at index ${coordinateIndex} (${deviationMeters}m offset)`,
                );
              }
            } else {
              // Normal location before deviation
              await this.trackingService.pushLocation({
                jobUuid: jobId,
                lat: coord.lat,
                lng: coord.lng,
              });

              this.logger.debug(
                `📍 [${jobId}] Normal location at index ${coordinateIndex}: ${coord.name}`,
              );
            }

            coordinateIndex++;
          } else {
            clearInterval(interval);
            this.activeSimulations.delete(jobId);

            await this.prismaService.job.update({
              where: { uuid: jobId },
              data: { jobStatus: 'finished' },
            });

            this.logger.log(`✓ [${jobId}] Off-route simulation completed`);
          }
        } catch (error) {
          this.logger.error(
            `Error during off-route simulation tick: ${error.message}`,
            error,
          );
        }
      }, intervalDuration);

      this.activeSimulations.set(jobId, interval);

      this.logger.log(
        `✓ Off-route simulation started for job ${jobId} (deviate at index ${deviateAtIndex}, offset ${deviationMeters}m)`,
      );

      return {
        success: true,
        message: 'Off-route simulation started',
        jobId,
        deviateAtIndex,
        deviationMeters,
        totalCoordinates: ROUTE_COORDINATES.length,
      };
    } catch (error) {
      this.logger.error(
        `✗ Failed to start off-route simulation: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Simulate with custom route coordinates
   */
  async simulateCustomRoute(jobId: string, dto: SimulateCustomRouteDto) {
    try {
      const job = await this.prismaService.job.findUnique({
        where: { uuid: jobId },
        include: { pickup: true, delivery: true, assignee: true },
      });

      if (!job) {
        return { success: false, message: 'Job not found' };
      }

      // Generate polyline from custom route
      const customPolyline = encodePolyline(dto.customRoute);

      // Update job with custom polyline
      await this.prismaService.delivery.update({
        where: { jobUuid: jobId },
        data: { polyline: customPolyline },
      });

      // Cache updated job details
      const detailsKey = `details_${jobId}`;
      job.delivery.polyline = customPolyline;
      await this.redisService.setJson(detailsKey, job);

      // Stop existing simulation
      if (this.activeSimulations.has(jobId)) {
        clearInterval(this.activeSimulations.get(jobId));
      }

      // Update job status
      await this.prismaService.job.update({
        where: { uuid: jobId },
        data: { jobStatus: 'in_progress' },
      });

      let coordinateIndex = 0;
      const intervalDuration = (dto.intervalSeconds || 3) * 1000;

      const interval = setInterval(async () => {
        try {
          if (coordinateIndex < dto.customRoute.length) {
            const coord = dto.customRoute[coordinateIndex];

            await this.trackingService.pushLocation({
              jobUuid: jobId,
              lat: coord.lat,
              lng: coord.lng,
            });

            this.logger.debug(
              `📍 [${jobId}] Custom route location ${coordinateIndex + 1}/${dto.customRoute.length}: ${coord.name || 'Point'}`,
            );

            coordinateIndex++;
          } else {
            clearInterval(interval);
            this.activeSimulations.delete(jobId);

            await this.prismaService.job.update({
              where: { uuid: jobId },
              data: { jobStatus: 'finished' },
            });

            this.logger.log(`✓ [${jobId}] Custom route simulation completed`);
          }
        } catch (error) {
          this.logger.error(
            `Error during custom route simulation tick: ${error.message}`,
            error,
          );
        }
      }, intervalDuration);

      this.activeSimulations.set(jobId, interval);

      this.logger.log(
        `✓ Custom route simulation started for job ${jobId} with ${dto.customRoute.length} waypoints`,
      );

      return {
        success: true,
        message: 'Custom route simulation started',
        jobId,
        totalWaypoints: dto.customRoute.length,
        customPolyline,
      };
    } catch (error) {
      this.logger.error(
        `✗ Failed to start custom route simulation: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Simulate throttled rerouting
   * Driver goes off-route, system triggers reroute after delay
   * Tests throttling mechanism
   */
  async simulateThrottledReroute(
    jobId: string,
    dto: SimulateThrottledRerouteDto,
  ) {
    try {
      const job = await this.prismaService.job.findUnique({
        where: { uuid: jobId },
        include: { pickup: true, delivery: true, assignee: true },
      });

      if (!job) {
        return { success: false, message: 'Job not found' };
      }

      // Cache job details
      const detailsKey = `details_${jobId}`;
      await this.redisService.setJson(detailsKey, job);

      // Stop existing simulation
      if (this.activeSimulations.has(jobId)) {
        clearInterval(this.activeSimulations.get(jobId));
      }

      // Update job status
      await this.prismaService.job.update({
        where: { uuid: jobId },
        data: { jobStatus: 'in_progress' },
      });

      let coordinateIndex = 0;
      let isDeviated = false;
      let deviationStartTime = 0;
      const intervalDuration = (dto.intervalSeconds || 3) * 1000;
      const deviateAtIndex = dto.deviateAtIndex || 2;
      const deviationMeters = dto.deviationMeters || 150;
      const rerouteDelaySeconds = dto.rerouteDelaySeconds || 2;

      const interval = setInterval(async () => {
        try {
          if (coordinateIndex < ROUTE_COORDINATES.length) {
            const coord = ROUTE_COORDINATES[coordinateIndex];

            // Start deviation
            if (coordinateIndex >= deviateAtIndex && !isDeviated) {
              isDeviated = true;
              deviationStartTime = Date.now();
              this.logger.warn(
                `🚨 [${jobId}] THROTTLE TEST: Deviation started at index ${coordinateIndex}`,
              );
            }

            if (isDeviated) {
              const deviated = getDeviatedCoordinate(
                coord.lat,
                coord.lng,
                deviationMeters,
              );

              const timeSinceDeviation =
                (Date.now() - deviationStartTime) / 1000;

              // Trigger off-route flag after delay
              if (timeSinceDeviation >= rerouteDelaySeconds) {
                await this.trackingService.pushLocation({
                  jobUuid: jobId,
                  lat: deviated.lat,
                  lng: deviated.lng,
                  isOffRoute: true,
                });

                this.logger.log(
                  `📍 [${jobId}] Off-route flag triggered after ${timeSinceDeviation.toFixed(1)}s deviation`,
                );

                // Clear deviation after reroute to continue normally
                isDeviated = false;
              } else {
                // Push deviated location without flag
                await this.trackingService.pushLocation({
                  jobUuid: jobId,
                  lat: deviated.lat,
                  lng: deviated.lng,
                });

                this.logger.debug(
                  `📍 [${jobId}] Deviated (${timeSinceDeviation.toFixed(1)}s/${rerouteDelaySeconds}s)`,
                );
              }
            } else {
              await this.trackingService.pushLocation({
                jobUuid: jobId,
                lat: coord.lat,
                lng: coord.lng,
              });
            }

            coordinateIndex++;
          } else {
            clearInterval(interval);
            this.activeSimulations.delete(jobId);

            await this.prismaService.job.update({
              where: { uuid: jobId },
              data: { jobStatus: 'finished' },
            });

            this.logger.log(
              `✓ [${jobId}] Throttled reroute simulation completed`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Error during throttle test tick: ${error.message}`,
            error,
          );
        }
      }, intervalDuration);

      this.activeSimulations.set(jobId, interval);

      this.logger.log(
        `✓ Throttled reroute simulation started for job ${jobId}`,
      );

      return {
        success: true,
        message:
          'Throttled reroute simulation started (tests throttling mechanism)',
        jobId,
        deviateAtIndex,
        deviationMeters,
        rerouteDelaySeconds,
        totalCoordinates: ROUTE_COORDINATES.length,
      };
    } catch (error) {
      this.logger.error(
        `✗ Failed to start throttled reroute simulation: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  /**
   * List all active simulations
   */
  async getActiveSimulations() {
    const activeJobs = Array.from(this.activeSimulations.keys());
    return {
      success: true,
      count: activeJobs.length,
      activeJobs,
    };
  }
}
