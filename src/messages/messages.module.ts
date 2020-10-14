import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { MessagesService } from './services/messages.service';
import { MessagesController } from './messages.controller';

@Module({
  imports: [UsersModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule { }
