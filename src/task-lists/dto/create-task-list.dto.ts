import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateTaskListDto {
  @IsUUID()
  @IsNotEmpty()
  uuidUser: string;

  @IsString()
  @IsNotEmpty()
  task: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}
