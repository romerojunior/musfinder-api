import { ApiProperty } from '@nestjs/swagger';
import { Message } from './message.model';

export class Conversation {
  @ApiProperty()
  guid?: string;

  @ApiProperty()
  members: string[];

  @ApiProperty()
  messages?: Message[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  latestMessage?: Message;
}