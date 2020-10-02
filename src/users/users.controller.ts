import { Body, Controller, Post, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { QueryUserDto, CreateUserDto } from './dto';
import { UsersService } from './users.service';
import { UserRelativeToPoint, Geolocation, User } from './interfaces';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<void> {
    return this.usersService.create(createUserDto);
  }

  @Get('locate')
  async locate(@Query() queryUserDto: QueryUserDto): Promise<UserRelativeToPoint[]> {
    return this.usersService.locate(queryUserDto.radius, <Geolocation>{
      latitude: queryUserDto.latitude,
      longitude: queryUserDto.longitude
    });
  }

  @Get(':guid')
  async getUser(@Param('guid') guid: string): Promise<User> {
    const user: User = await this.usersService.getByGUID(guid);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  @Get(':guid/geolocation')
  async getUserGeolocation(@Param('guid') guid: string): Promise<Geolocation> {
    const geolocation: Geolocation = await this.usersService.getGeolocationByGUID(guid);
    if (!geolocation) {
      throw new NotFoundException();
    }
    return geolocation;
  }
}
