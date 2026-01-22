import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { MapsService, SimpleDirectionsResponse } from './maps.service';
import { ApiProperty } from '@nestjs/swagger';

export class GetDirectionsDto {
  @IsNumber()
  @ApiProperty({
    description: 'Pickup location latitude',
    example: 1.1272,
  })
  pickupLat: number;

  @IsNumber()
  @ApiProperty({
    description: 'Pickup location longitude',
    example: 104.0533,
  })
  pickupLng: number;

  @IsNumber()
  @ApiProperty({
    description: 'Delivery location latitude',
    example: 1.1312,
  })
  deliveryLat: number;

  @IsNumber()
  @ApiProperty({
    description: 'Delivery location longitude',
    example: 104.0154,
  })
  deliveryLng: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: 'Return alternative routes (1-3 routes). Default: true',
    example: true,
    required: false,
  })
  alternatives?: boolean;
}

class LocationDetail {
  @ApiProperty({
    example:
      '43H3+26G, Teluk Tering, Batam Kota, Batam City, Riau Islands, Indonesia',
  })
  address: string;

  @ApiProperty({ example: 1.1272763 })
  lat: number;

  @ApiProperty({ example: 104.0533077 })
  lng: number;
}

class DetailsInfo {
  @ApiProperty()
  from: LocationDetail;

  @ApiProperty()
  to: LocationDetail;
}

class RouteOption {
  @ApiProperty({ example: 'Route A' })
  name: string;

  @ApiProperty({ example: '6.0 km' })
  distance: string;

  @ApiProperty({ example: '13 mins' })
  duration: string;

  @ApiProperty({
    example: 'od{Ee|azREdAE`@GXCb@...',
    description: 'Encoded polyline for the route',
  })
  polyline: string;
}

class SimplifiedDirectionsResponse {
  @ApiProperty()
  details: DetailsInfo;

  @ApiProperty({
    type: [RouteOption],
    description: 'List of route options (Route A, B, C)',
  })
  routes: RouteOption[];
}

@ApiTags('Maps')
@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  /**
   * Get directions between pickup and delivery locations
   * Returns simplified route recommendations with polylines
   */
  @Post('directions')
  @ApiOperation({
    summary: 'Get directions from pickup to delivery',
    description:
      'Get route directions from pickup location to delivery location. ' +
      'Returns simplified response with 1-3 recommended routes, each with distance, duration, and polyline.',
  })
  @ApiBody({
    type: GetDirectionsDto,
    description: 'Pickup and delivery coordinates',
    examples: {
      default: {
        summary: 'Example: Batam route',
        value: {
          pickupLat: 1.1272,
          pickupLng: 104.0533,
          deliveryLat: 1.1312,
          deliveryLng: 104.0154,
          alternatives: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Directions retrieved successfully. Returns simplified routes with details.',
    type: SimplifiedDirectionsResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid coordinates provided',
  })
  @ApiResponse({
    status: 500,
    description: 'Google Maps API error or no route found',
  })
  async getDirections(
    @Body() dto: GetDirectionsDto,
  ): Promise<SimpleDirectionsResponse> {
    const {
      pickupLat,
      pickupLng,
      deliveryLat,
      deliveryLng,
      alternatives = true,
    } = dto;

    if (
      isNaN(pickupLat) ||
      isNaN(pickupLng) ||
      isNaN(deliveryLat) ||
      isNaN(deliveryLng)
    ) {
      throw new BadRequestException('Invalid latitude or longitude values');
    }

    return this.mapsService.getDirections(
      pickupLat,
      pickupLng,
      deliveryLat,
      deliveryLng,
      alternatives,
    );
  }
}
