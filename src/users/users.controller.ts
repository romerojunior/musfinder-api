import { Body, Controller, Post, Get, Query, ParseIntPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<void> {
    return this.usersService.create(createUserDto);
  }

  @Get('locate')
  find(@Query() query: any): Promise<void> {
    return this.usersService.locate(query.radius, {latitude: query.latitude, longitude: query.longitude});
  }

}
