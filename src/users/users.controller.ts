import { Body, Controller, Get, Post, Query, Param} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/')
  async getUsers(@Query() query) {
    return await this.usersService.findByGeolocation(query.latitude, query.longitude);
  }

  @Post('/geolocation')
  postGeolocation(@Body() body: any) {
    // return this.usersService.create();
  }

  @Get('/:id/geolocation')
  getUserLocation(@Param() params: any) {
    return this.usersService.getLocationByUserId(params.id);
  }

  @Post('/:id/geolocation')
  postUserLocation(@Param('id') id: any, @Body() body: any) {
    return this.usersService.updateLocationByUserId(id, body);
  }

}
