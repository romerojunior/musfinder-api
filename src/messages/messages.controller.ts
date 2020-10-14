import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { MessagesService } from './services/messages.service';

@ApiTags('messages')
@Controller('messages')
@UseGuards(AuthGuard)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
  ) { }

  @Get()
  async get(): Promise<void> {
    return this.messagesService.get("placeholder");
  }

}
