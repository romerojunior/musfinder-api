import { Controller, UseGuards, Get, Param, Post, Body, Query, ForbiddenException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { MessagesService } from './services/messages.service';
import { Message } from './models';
import { UserToken } from '../common/decorators';
import { SendMessageDto } from './dto';
import { has } from 'lodash';

@ApiTags('messages')
@Controller('messages')
@UseGuards(AuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) { }

  @Get(':guid')
  async get(
    @Param('guid') messageID: string,
  ): Promise<any> {
    return this.messagesService.getOne(messageID);
  }

  @Post()
  async send(
    @UserToken('user_id') userID: string,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<any> {
    return this.messagesService.send(userID, sendMessageDto);
  }

  @Get()
  async query(
    @UserToken('user_id') userID: string,
    @Query() query: any,
  ): Promise<Message[]> {
    if (has(query, 'latest')) {
      return this.messagesService.getLatest(userID);
    }
    if (query.conversation) {
      return this.messagesService.getConversation(userID, query.conversation);
    }
    throw new ForbiddenException();
  }

}
