import { Body, Controller, Post, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { QueryUserDto, CreateUserDto } from './dto';
import { UsersService } from './users.service';
import { Geolocation, User, Error } from './interfaces';
import { ApiTags, ApiNotFoundResponse, ApiOkResponse, ApiBadRequestResponse, ApiCreatedResponse } from '@nestjs/swagger';

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
  @Get(':guid/geolocation')
  async getUserGeolocation(@Param('guid') guid: string): Promise<Geolocation> {
    const geolocation: Geolocation = await this.usersService.getGeolocationByGUID(guid);
    if (!geolocation) {
      throw new NotFoundException();
    }
    return geolocation;
  }
}
