import { Body, Controller, Post, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ParseFloatPipe } from './pipes/parse-float.pipe';
import { CreateUserDto } from './dto/create-user.dto';
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
  locate(
    @Query('radius', ParseIntPipe) radius: number,
    @Query('latitude', ParseFloatPipe) latitude: number,
    @Query('longitude', ParseFloatPipe) longitude: number,
  ): Promise<UserRelativeToPoint[]> {
    return this.usersService.locate(radius, {
      latitude: latitude,
      longitude: longitude
    });
  }

}
