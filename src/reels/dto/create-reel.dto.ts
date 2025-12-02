import { IsUUID, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateReelDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  source: string;

  @IsUUID()
  @IsNotEmpty()
  createdBy: string;
}
