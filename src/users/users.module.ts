import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './services/users.service';
import { FriendshipService } from './services/friendship.service';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, FriendshipService],
})
export class UsersModule {}
