import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './conversations/conversations.module';

@Module({
  imports: [UsersModule, MessagesModule],
})
export class AppModule { }
