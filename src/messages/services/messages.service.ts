import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class MessagesService {
  constructor(private readonly usersService: UsersService) { }

  async get(id: string): Promise<void> {
    console.log(id);
  }
}
