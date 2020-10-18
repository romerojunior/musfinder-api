import { Controller, UseGuards, Get, Param, Post, Body, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { ConversationService } from './services/conversations.service';
import { UserToken } from '../common/decorators';
import { SendMessageDto } from './dto';

@ApiTags('conversations')
@Controller('conversations')
@UseGuards(AuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationService) { }

  @Post()
  async send(
    @UserToken('user_id') userID: string,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<any> {
    if (userID != sendMessageDto.from) {
      throw new UnauthorizedException();
    }
    return this.conversationsService.sendMessage(sendMessageDto);
  }

  @Get()
  async get(
    @UserToken('user_id') userID: string,
  ): Promise<any> {
    return this.conversationsService.getByMember(userID);
  }

  @Get(':guid')
  async getMessages(
    @UserToken('user_id') userID: string,
    @Param('guid') conversationID: string,
  ): Promise<any> {
    return this.conversationsService.readMessages(userID, conversationID);
  }

}
