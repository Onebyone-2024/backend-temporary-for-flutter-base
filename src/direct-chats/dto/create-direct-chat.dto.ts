import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateDirectChatDto {
  @IsUUID()
  @IsNotEmpty()
  uuid1: string;

  @IsUUID()
  @IsNotEmpty()
  uuid2: string;
}
