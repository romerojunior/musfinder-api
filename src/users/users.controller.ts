import { Body, Controller, Post, Get, Param, UseGuards, Headers, Patch } from '@nestjs/common';
import { SearchUserDto, CreateUserDto, UpdateFriendshipDto, RequestFriendshipDto } from './dto';
import { UsersService } from './services/users.service';
import { User, Error } from './models';
import { ApiTags, ApiNotFoundResponse, ApiOkResponse, ApiBadRequestResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { privateHeaders } from '../common/constants';
import { UsersFriendshipService } from './services/users-friendship.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersFriendshipService: UsersFriendshipService,
  ) { }

  /**
   * The `create` method takes an instance of `CreateUserDto` via the body of an
   * authenticated request and calls the user service to finally persist it.
   *
   * @param createUserDto an instance of `CreateUserDto` representing an user.
   * @param guid a string representing the GUID of a user.
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
    @Body() createUserDto: CreateUserDto,
    @Headers(privateHeaders.AUTHENTICATED_USER_GUID) guid: string,
  ): Promise<void> {
    createUserDto.guid = guid;
    return this.usersService.create(createUserDto);
  }

  /**
   * The `search` method takes an instance of `SearchUserDto` via the body of an
   * authenticated request (based on `Authentication` header) and returns a list of users
   * matching the `SearchUserDto` criterias.
   *
   * @param searchUserDto an instance of `searchUserDto` representing all search criterias.
   *
   * @returns a list of `Users`.
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
   * @param guid a string representing the GUID of a user.
   * @param remoteGUID a string representing the GUID of a user.
   *
   * @returns a `User` representing requested resource.
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
    @Param('guid') guid: string,
  ): Promise<User> {
    return this.usersService.get(guid);
  }

  /**
   * The `calculateDistance` method tries retrieves the distance between an authenticated
   * user (based on `Authentication` header) and the requested resource (represented by
   * `guid`).
   *
   * @param currentGUID a string representing the GUID of an authenticated user.
   * @param remoteGUID a string representing the GUID of a user.
   *
   * @returns a `number` representing the distance in kilometers.
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
    @Param('guid') remoteGUID: string,
    @Headers(privateHeaders.AUTHENTICATED_USER_GUID) currentGUID: string,
  ): Promise<number> {
    return this.usersService.calculateDistanceBetweenGUIDs(currentGUID, remoteGUID);
  }

  @UseGuards(AuthGuard)
  @Get('me/friendships')
  async initAssociation(
    @Headers(privateHeaders.AUTHENTICATED_USER_GUID) currentGUID: string,
  ): Promise<void> {
    return this.usersFriendshipService.get(currentGUID);
  }

  @UseGuards(AuthGuard)
  @Post('me/friendships')
  async requestFriendship(
    @Body() requestFriendshipDto: RequestFriendshipDto,
    @Headers(privateHeaders.AUTHENTICATED_USER_GUID) currentGUID: string,
  ): Promise<any> {
    return this.usersFriendshipService.request(currentGUID, requestFriendshipDto);
  }

  @UseGuards(AuthGuard)
  @Patch('me/friendships/:guid')
  async updateFriendship(
    @Body() updateFriendshipDto: UpdateFriendshipDto,
    @Param('guid') friendshipGUID: string,
    @Headers(privateHeaders.AUTHENTICATED_USER_GUID) currentGUID: string,
  ): Promise<void> {
    await this.usersFriendshipService.update(friendshipGUID, updateFriendshipDto);
  }
}
