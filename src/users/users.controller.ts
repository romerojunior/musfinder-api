import { Body, Controller, Post, Get, Param, UnauthorizedException, NotFoundException, UseGuards, Headers } from '@nestjs/common';
import { SearchUserDto, CreateUserDto } from './dto';
import { UsersService } from './users.service';
import { Geolocation, User, Error } from './models';
import { ApiTags, ApiNotFoundResponse, ApiOkResponse, ApiBadRequestResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { apiHeaders } from '../common/contants';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiCreatedResponse({
    description: 'User has been created.'
  })
  @ApiBadRequestResponse({
    description: 'Bad request.',
    type: Error,
  })
  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Headers(apiHeaders.X_MUSFINDER_USER_ID) guid: string,
    @Body() createUserDto: CreateUserDto
  ): Promise<void> {
    createUserDto.guid = guid;
    return this.usersService.create(createUserDto);
  }

  @ApiOkResponse({
    description: 'User has been found.',
    type: [User],
  })
  @ApiNotFoundResponse({
    description: 'Geolocation not found.',
    type: Error,
  })
  @ApiBadRequestResponse({
    description: 'Bad request.',
    type: Error,
  })
  @Get('search')
  async locate(
    @Body() searchUserDto: SearchUserDto
  ): Promise<User[]> {
    return this.usersService.search(searchUserDto);
  }

  @ApiOkResponse({
    description: 'User has been found.',
    type: User,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
    type: Error,
  })
  @Get(':guid')
  async getUser(
    @Param('guid') guid: string
  ): Promise<User> {
    const user: User = await this.usersService.getUserByGUID(guid);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  @ApiOkResponse({
    description: 'Geolocation has been found.',
    type: Geolocation,
  })
  @ApiNotFoundResponse({
    description: 'Geolocation not found.',
    type: Error,
  })
  @UseGuards(AuthGuard)
  @Get(':guid/distance')
  async getUserGeolocation(
    @Headers(apiHeaders.X_MUSFINDER_USER_ID) currentGUID: string,
    @Param('guid') remoteGUID: string
  ): Promise<number> {
    return this.usersService.getDistanceByGUIDs(currentGUID, remoteGUID);
  }
}
