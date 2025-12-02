import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateGroupMemberDto {
  @IsUUID()
  @IsNotEmpty()
  groupUuid: string;

  @IsUUID()
  @IsNotEmpty()
  userUuid: string;
}
