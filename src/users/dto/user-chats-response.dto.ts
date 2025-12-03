export class UserChatsResponseDto {
  uuid: string;
  name: string;
  type: 'direct' | 'group';
  photo?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount?: number;
}
