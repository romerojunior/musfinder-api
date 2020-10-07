import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './services/users.service';
import { UsersFriendshipService } from './services/users-friendship.service';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, UsersFriendshipService],
})
export class UsersModule {}
