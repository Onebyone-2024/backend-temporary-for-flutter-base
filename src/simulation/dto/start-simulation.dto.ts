import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StartSimulationDto {
  @ApiProperty({
    example: 3,
    description: 'Interval in seconds between location updates',
    required: false,
    default: 3,
  })
  @IsOptional()
  @IsNumber()
  intervalSeconds?: number = 3;
}

export class SimulateOffRouteDto {
  @ApiProperty({
    example: 2,
    description: 'Index of coordinate to deviate from (0-based)',
    required: false,
    default: 2,
  })
  @IsOptional()
  @IsNumber()
  deviateAtIndex?: number = 2;

  @ApiProperty({
    example: 150,
    description: 'Distance deviation in meters from original route',
    required: false,
    default: 150,
  })
  @IsOptional()
  @IsNumber()
  deviationMeters?: number = 150;

  @ApiProperty({
    example: 3,
    description: 'Interval in seconds between location updates',
    required: false,
    default: 3,
  })
  @IsOptional()
  @IsNumber()
  intervalSeconds?: number = 3;
}

export class CoordinateInput {
  @ApiProperty({ example: 1.1258311, description: 'Latitude' })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 104.0515445, description: 'Longitude' })
  @IsNumber()
  lng: number;

  @ApiProperty({
    example: 'Start Point',
    description: 'Location name (optional)',
    required: false,
  })
  @IsOptional()
  name?: string;
}

export class SimulateCustomRouteDto {
  @ApiProperty({
    description: 'Array of custom coordinates to follow',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        lat: { type: 'number' },
        lng: { type: 'number' },
        name: { type: 'string' },
      },
    },
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoordinateInput)
  customRoute: CoordinateInput[];

  @ApiProperty({
    example: 3,
    description: 'Interval in seconds between location updates',
    required: false,
    default: 3,
  })
  @IsOptional()
  @IsNumber()
  intervalSeconds?: number = 3;
}

export class SimulateThrottledRerouteDto {
  @ApiProperty({
    example: 2,
    description: 'Index to start off-route deviation',
    required: false,
    default: 2,
  })
  @IsOptional()
  @IsNumber()
  deviateAtIndex?: number = 2;

  @ApiProperty({
    example: 150,
    description: 'Distance deviation in meters',
    required: false,
    default: 150,
  })
  @IsOptional()
  @IsNumber()
  deviationMeters?: number = 150;

  @ApiProperty({
    example: 2,
    description: 'Wait time before trigger off-route flag (seconds)',
    required: false,
    default: 2,
  })
  @IsOptional()
  @IsNumber()
  rerouteDelaySeconds?: number = 2;

  @ApiProperty({
    example: 3,
    description: 'Interval in seconds between location updates',
    required: false,
    default: 3,
  })
  @IsOptional()
  @IsNumber()
  intervalSeconds?: number = 3;
}
