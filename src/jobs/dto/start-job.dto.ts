import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class StartJobDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Job UUID',
  })
  @IsString()
  jobUuid: string;

  @ApiProperty({
    example: 10.5,
    description: 'Current latitude of the user',
  })
  @IsNumber()
  lat: number;

  @ApiProperty({
    example: 20.3,
    description: 'Current longitude of the user',
  })
  @IsNumber()
  lng: number;
}
