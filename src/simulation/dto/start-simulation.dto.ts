import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class StartSimulationDto {
  @ApiProperty({
    example: 3,
    description: 'Interval in seconds between location updates',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  intervalSeconds?: number = 3;
}
