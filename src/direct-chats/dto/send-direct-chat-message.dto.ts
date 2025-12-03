import { IsUUID, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SendDirectChatMessageDto {
  @IsUUID()
  @IsNotEmpty()
  senderUuid: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  message: string;
}
