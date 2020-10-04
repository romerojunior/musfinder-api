import { Body, Controller, Post, Get, Param, UseGuards, Headers } from '@nestjs/common';
import { SearchUserDto, CreateUserDto } from './dto';
import { UsersService } from './users.service';
import { User, Error } from './models';
import { ApiTags, ApiNotFoundResponse, ApiOkResponse, ApiBadRequestResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { apiHeaders } from '../common/contants';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  /**
   * The `create` method takes an instance of `CreateUserDto` via the body of an
   * authenticated request and calls the user service to finally persist it.
   *
   * @param createUserDto an instance of `CreateUserDto` representing an user.
   */
  @ApiCreatedResponse({
    description: 'User has been created.'
  })
  @ApiBadRequestResponse({
    description: 'Bad request.',
    type: Error,
  })
  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Headers(apiHeaders.X_MUSFINDER_USER_ID) guid: string,
    @Body() createUserDto: CreateUserDto
  ): Promise<void> {
    createUserDto.guid = guid;
    return this.usersService.create(createUserDto);
  }

  /**
   * The `search` method takes an instance of `SearchUserDto` via the body of an 
   * authenticated request and returns a list of users matching the `SearchUserDto`
   * criterias.
   *
   * @param searchUserDto an instance of `searchUserDto` representing all search criterias.
   *
   * @returns A list of `Users`.
   */
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
  @Get('search')
  async search(
    @Body() searchUserDto: SearchUserDto
  ): Promise<User[]> {
    return this.usersService.search(searchUserDto);
  }

  /**
   * The `getUser` method tries to retrieve a user resource by its GUID.
   * 
   * @param guid string representing the GUID of a user.
   * @param remoteGUID string representing the GUID of a user.
   *
   * @returns A `User` representing requested resource.
   */
  @ApiOkResponse({
    description: 'User has been found.',
    type: User,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
    type: Error,
  })
  @Get(':guid')
  async getUser(
    @Param('guid') guid: string
  ): Promise<User> {
    return this.usersService.get(guid);
  }

  /**
   * The `calculateDistance` method retrieve the distance between an authenticated user 
   * (based on headers) and the requested resource (represented by `guid`).
   * 
   * @param currentGUID string representing the GUID of a user.
   * @param remoteGUID string representing the GUID of a user.
   *
   * @returns A `number` representing the distance in kilometers.
   */
  @ApiOkResponse({
    description: 'The distance in kilometers between authorized request and resource.',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'The requested resource could not be found.',
    type: Error,
  })
  @UseGuards(AuthGuard)
  @Get(':guid/distance')
  async calculateDistance(
    @Headers(apiHeaders.X_MUSFINDER_USER_ID) currentGUID: string,
    @Param('guid') remoteGUID: string
  ): Promise<number> {
    return this.usersService.calculateDistanceBetweenGUIDs(currentGUID, remoteGUID);
  }
}
