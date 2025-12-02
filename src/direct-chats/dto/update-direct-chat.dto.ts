import { PartialType } from '@nestjs/mapped-types';
import { CreateDirectChatDto } from './create-direct-chat.dto';

export class UpdateDirectChatDto extends PartialType(CreateDirectChatDto) {}
