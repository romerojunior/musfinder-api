import { Body, Controller, Post, Get, Query, Param, NotFoundException, UseGuards,Headers } from '@nestjs/common';
import { QueryUserDto, CreateUserDto } from './dto';
import { UsersService } from './users.service';
import { Geolocation, User, Error } from './interfaces';
import { ApiTags, ApiNotFoundResponse, ApiOkResponse, ApiBadRequestResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import * as constants from '../common/constants';

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
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<void> {
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

  @Get(':guid')
  @ApiOkResponse({
    description: 'User has been found.',
    type: User,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
    type: Error,
  })
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
    const userGUID: string = headers[constants.HEADERS.X_MUSFINDER_USER_ID];
    const geolocation: Geolocation = await this.usersService.getGeolocationByGUID(userGUID);
    if (!geolocation) {
      throw new NotFoundException();
    }
    return geolocation;
  }
}
