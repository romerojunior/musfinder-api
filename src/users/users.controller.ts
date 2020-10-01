import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { CreateUserDto, QueryUserDto } from './dto';
import { UsersService } from './users.service';
import { UserRelativeToPoint } from './interfaces';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<void> {
    return this.usersService.create(createUserDto);
  }

  @Get('locate')
  locate(@Query() queryUserDto: QueryUserDto): Promise<UserRelativeToPoint[]> {
    return this.usersService.locate(queryUserDto.radius, {
      latitude: queryUserDto.latitude,
      longitude: queryUserDto.longitude
    });
  }

}
