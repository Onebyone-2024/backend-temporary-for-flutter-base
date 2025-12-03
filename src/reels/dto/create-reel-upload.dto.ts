import { IsOptional, IsString } from 'class-validator';

export class CreateReelUploadDto {
  @IsOptional()
  @IsString()
  description?: string;
}
