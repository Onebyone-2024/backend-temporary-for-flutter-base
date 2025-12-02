import { IsUUID, IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupChatDto {
  @IsString()
  @IsNotEmpty()
  textMessage: string;

  @IsUUID()
  @IsNotEmpty()
  createdBy: string;

  @IsUUID()
  @IsNotEmpty()
  groupUuid: string;
}
