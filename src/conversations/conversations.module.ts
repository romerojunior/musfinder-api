import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { ConversationService } from './services/conversations.service';
import { ConversationsController } from './conversations.controller';

@Module({
  imports: [UsersModule],
  controllers: [ConversationsController],
  providers: [ConversationService],
})
export class MessagesModule { }
