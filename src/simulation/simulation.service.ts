import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrackingService } from '../tracking/tracking.service';
import { StartSimulationDto } from './dto/start-simulation.dto';

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

@Injectable()
export class SimulationService {
  private activeSimulations: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly trackingService: TrackingService,
  ) {}

  async createSimulationJob() {
    // Fetch driver user from DB by email
    const driver = await this.prismaService.user.findUnique({
      where: { email: 'driver@example.com' },
    });

    if (!driver) {
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

    return {
      success: true,
      message: 'Simulation job created successfully with dummy data',
      jobId: job.uuid,
      job,
    };
  }

  async startSimulation(jobId: string, dto: StartSimulationDto) {
    // Validasi job exists
    const job = await this.prismaService.job.findUnique({
      where: { uuid: jobId },
      include: { delivery: true },
    });

    if (!job) {
      return {
        success: false,
        message: 'Job not found',
      };
    }

    // Update job status to IN_PROGRESS
    await this.prismaService.job.update({
      where: { uuid: jobId },
      data: { jobStatus: 'in_progress' },
    });

    // Stop any existing simulation for this job
    if (this.activeSimulations.has(jobId)) {
      clearInterval(this.activeSimulations.get(jobId));
    }

    // Get polyline from job delivery
    const polyline = job.delivery?.polyline || 'Empty';

    // Start pushing locations
    let coordinateIndex = 0;
    const intervalDuration = (dto.intervalSeconds || 3) * 1000;

    const interval = setInterval(async () => {
      if (coordinateIndex < ROUTE_COORDINATES.length) {
        const coord = ROUTE_COORDINATES[coordinateIndex];

        // Push location update via WebSocket
        await this.trackingService.pushLocationToSocket(jobId, {
          lat: coord.lat,
          lng: coord.lng,
          timestamp: new Date().toISOString(),
          polyline,
        });

        console.log(
          `📍 [${jobId}] Location ${coordinateIndex + 1}/${ROUTE_COORDINATES.length}: ${coord.name}`,
        );

        coordinateIndex++;
      } else {
        // Selesai - finish job
        clearInterval(interval);
        this.activeSimulations.delete(jobId);

        await this.prismaService.job.update({
          where: { uuid: jobId },
          data: { jobStatus: 'finished' },
        });

        console.log(`✓ [${jobId}] Simulation completed!`);
      }
    }, intervalDuration);

    this.activeSimulations.set(jobId, interval);

    return {
      success: true,
      message: `Simulation started - pushing locations every ${dto.intervalSeconds || 3} seconds`,
      jobId,
      totalCoordinates: ROUTE_COORDINATES.length,
      intervalSeconds: dto.intervalSeconds || 3,
    };
  }

  async stopSimulation(jobId: string) {
    if (this.activeSimulations.has(jobId)) {
      clearInterval(this.activeSimulations.get(jobId));
      this.activeSimulations.delete(jobId);

      // Update job status to FINISHED
      await this.prismaService.job.update({
        where: { uuid: jobId },
        data: { jobStatus: 'finished' },
      });

      return {
        success: true,
        message: 'Simulation stopped',
        jobId,
      };
    }

    return {
      success: false,
      message: 'No active simulation for this job',
    };
  }
}
