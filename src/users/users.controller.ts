import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { QueryUserDto, CreateUserDto } from './dto';
import { UsersService } from './users.service';
import { UserRelativeToPoint, Geolocation } from './interfaces';

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

}
