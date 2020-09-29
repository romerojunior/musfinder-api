import { Body, Controller, Post, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<void> {
    return this.usersService.create(createUserDto);
  }

  @Get(':radius')
  get(@Param('radius', ParseIntPipe) radius: number): Promise<void> {
    return this.usersService.get(radius);
  }

}
