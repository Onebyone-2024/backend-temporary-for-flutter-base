import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

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
    description: 'Optional polyline for route update (reroute scenario)',
    required: false,
  })
  @IsOptional()
  @IsString()
  polyline?: string;
}
