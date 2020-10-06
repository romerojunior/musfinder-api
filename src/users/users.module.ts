import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './services/users.service';
import { UsersAssociationService } from './services/usersAssociation.service';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, UsersAssociationService],
})
export class UsersModule {}
