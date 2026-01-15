import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PickupDto {
  @ApiProperty({
    example: 'Warehouse, Jl. Sudirman No. 123, Jakarta',
  })
  @IsString()
  address: string;

  @ApiProperty({
    example: -6.2088,
  })
  @IsNumber()
  lat: number;

  @ApiProperty({
    example: 106.8456,
  })
  @IsNumber()
  lng: number;
}

export class DeliveryDto {
  @ApiProperty({
    example: 'Customer Office, Jl. Gatot Subroto No. 456, Jakarta',
  })
  @IsString()
  address: string;

  @ApiProperty({
    example: -6.225,
  })
  @IsNumber()
  lat: number;

  @ApiProperty({
    example: 106.799,
  })
  @IsNumber()
  lng: number;

  @ApiProperty({
    example: 'enc:{wsiFljiiBrB~A...',
    required: false,
  })
  @IsOptional()
  @IsString()
  polyline?: string;

  @ApiProperty({
    example: 5.2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  distanceKm?: number;

  @ApiProperty({
    example: '2026-01-15T03:00:00Z',
    description: 'Estimated Time of Arrival (ETA)',
  })
  @IsString()
  eta: string;

  @ApiProperty({
    example: '2026-01-15T03:15:00Z',
    description: 'Estimated Time of Departure (ETD)',
  })
  @IsString()
  etd: string;

  @ApiProperty({
    example: 15,
    description: 'Estimated duration in minutes',
  })
  @IsNumber()
  estimateDuration: number;
}

export class CreateJobDto {
  @ApiProperty({
    example: 'Deliver package to customer',
    description: 'Job description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID of user assigned to this job',
    required: false,
  })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({
    description: 'Pickup location details',
    type: PickupDto,
  })
  @ValidateNested()
  @Type(() => PickupDto)
  pickup: PickupDto;

  @ApiProperty({
    description: 'Delivery location details with time estimates',
    type: DeliveryDto,
  })
  @ValidateNested()
  @Type(() => DeliveryDto)
  delivery: DeliveryDto;
}
