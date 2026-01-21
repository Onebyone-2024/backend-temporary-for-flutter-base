import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

/**
 * Entry in polyline log history
 */
export class PolylineLogEntry {
  @ApiProperty({
    example: 'enc:{wsiFljiiBrB~A...',
    description: 'Encoded polyline',
  })
  polyline: string;

  @ApiProperty({
    example: '2026-01-21T10:30:45.123Z',
    description: 'ISO timestamp when polyline was created',
  })
  timestamp: string;

  @ApiProperty({
    example: 'off_route',
    enum: ['initial', 'reroute', 'off_route'],
    description: 'Reason for polyline change',
  })
  reason?: 'initial' | 'reroute' | 'off_route';

  @ApiProperty({
    example: 150.5,
    description: 'Distance from previous polyline in meters (for off_route)',
    required: false,
  })
  distanceFromPreviousRoute?: number;
}

export class PushLocationDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Job UUID',
  })
  @IsString()
  jobUuid: string;

  @ApiProperty({
    example: 10.5,
    description: 'Current latitude',
  })
  @IsNumber()
  lat: number;

  @ApiProperty({
    example: 20.3,
    description: 'Current longitude',
  })
  @IsNumber()
  lng: number;

  @ApiProperty({
    example: 'enc:{wsiFljiiBrB~A...',
    description: 'Optional polyline for explicit route update',
    required: false,
  })
  @IsOptional()
  @IsString()
  polyline?: string;

  @ApiProperty({
    example: false,
    description:
      'Flag indicating driver is off-route (system will auto-generate new polyline)',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isOffRoute?: boolean;
}
