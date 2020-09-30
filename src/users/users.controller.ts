import { Body, Controller, Post, Get, UsePipes, Query, ParseIntPipe, ValidationPipe } from '@nestjs/common';
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
  locate(@Query() query: any): Promise<void> {
    return this.usersService.locate(parseInt(query.radius), {
      latitude: parseFloat(query.latitude),
      longitude: parseFloat(query.longitude)
    });
  }

}
