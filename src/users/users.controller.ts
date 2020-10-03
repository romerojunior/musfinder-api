import { Body, Controller, Post, Get, Query, Param, NotFoundException, UseGuards, Headers } from '@nestjs/common';
import { QueryUserDto, CreateUserDto } from './dto';
import { UsersService } from './users.service';
import { Geolocation, User, Error } from './models';
import { ApiTags, ApiNotFoundResponse, ApiOkResponse, ApiBadRequestResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { apiHeaders } from '../common/contants';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCreatedResponse({
    description: 'User has been created.'
  })
  @ApiBadRequestResponse({
    description: 'Bad request.',
    type: Error,
  })
  @UseGuards(AuthGuard)
  @Post()
  async create(@Headers() headers: any, @Body() createUserDto: CreateUserDto): Promise<void> {
    createUserDto.guid = headers[apiHeaders.X_MUSFINDER_USER_ID];
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
  @Get('locate')
  async locate(@Query() queryUserDto: QueryUserDto): Promise<User[]> {
    return this.usersService.locate(queryUserDto.radius, <Geolocation>{
      latitude: queryUserDto.latitude,
      longitude: queryUserDto.longitude
    });
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
  async getUser(@Param('guid') guid: string): Promise<User> {
    const user: User = await this.usersService.getByGUID(guid);
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
  @Get(':guid/geolocation')
  async getUserGeolocation(@Headers() headers: any, @Param('guid') guid: string): Promise<Geolocation> {
    const userGUID: string = headers[apiHeaders.X_MUSFINDER_USER_ID];
    const geolocation: Geolocation = await this.usersService.getGeolocationByGUID(userGUID);
    if (!geolocation) {
      throw new NotFoundException();
    }
    return geolocation;
  }
}
