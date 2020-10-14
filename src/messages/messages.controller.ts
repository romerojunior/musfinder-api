import { Controller, UseGuards, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { MessagesService } from './services/messages.service';
import { Message } from './models';

@ApiTags('messages')
@Controller('messages')
// @UseGuards(AuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) { }

  @Get(':guid')
  async get(
    @Param('guid') messageID: string,
  ): Promise<Message> {
    return this.messagesService.getOne(messageID);
  }

}
