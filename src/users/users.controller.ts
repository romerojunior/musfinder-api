import { Body, Controller, Post, Get, Param, UseGuards, Patch, Delete } from '@nestjs/common';
import { SearchUserDto, CreateUserDto, UpdateFriendshipDto, RequestFriendshipDto } from './dto';
import { UsersService } from './services/users.service';
import { User, Error, Friendship } from './models';
import { ApiTags, ApiNotFoundResponse, ApiOkResponse, ApiBadRequestResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { UsersFriendshipService } from './services/users-friendship.service';
import { UserToken } from '../common/decorators';

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersFriendshipService: UsersFriendshipService,
  ) { }

  /**
   * The `create` method takes an instance of `CreateUserDto` as argument and calls the 
   * user service to finally persist it.
   *
   * @param userID a string representing the guid of a user.
   * @param createUserDto an instance of `CreateUserDto`.
   */
  @Post()
  async create(
    @UserToken('user_id') userID: string,
    @Body() createUserDto: CreateUserDto,
  ): Promise<void> {
    await this.usersService.create(userID, createUserDto);
  }

  /**
   * The `search` method takes an instance of `SearchUserDto` as argument and returns a 
   * list of users matching the `SearchUserDto` criterias.
   *
   * @param searchUserDto an instance of `searchUserDto` representing all search criterias.
   *
   * @returns a list of `Users`.
   */
  @Get('search')
  async search(
    @Body() searchUserDto: SearchUserDto
  ): Promise<User[]> {
    return this.usersService.search(searchUserDto);
  }

  /**
   * The `getUser` method takes a user id (`guid`) as argument and tries to retrieve a 
   * user that matches with it.
   *
   * @param userID a string representing the guid of a user.
   *
   * @returns a `User` representing requested resource.
   */
  @Get(':userID')
  async getUser(
    @Param('userID') userID: string,
  ): Promise<User> {
    return this.usersService.get(userID);
  }

  /**
   * The `calculateDistance` method takes two user ids as arguments and returns the
   * geographical distance between their coordinates.
   *
   * @param currentUserID a string representing the guid of a user.
   * @param remoteUserID a string representing the guid of a user.
   *
   * @returns a `number` representing the distance in kilometers.
   */
  @Get(':guid/distance')
  async calculateDistance(
    @UserToken('user_id') currentUserID: string,
    @Param('guid') remoteUserID: string,
  ): Promise<number> {
    return this.usersService.calculateDistanceBetweenIDs(currentUserID, remoteUserID);
  }

  /**
   * The `getFriendships` method takes a user id as argument and returns a list of
   * `Friendship` instances related to this user.
   *
   * @param userID a string representing the guid of a user.
   *
   * @returns a list of `Friendship` instances.
   */
  @Get('me/friendships')
  async getFriendships(
    @UserToken('user_id') userID: string,
  ): Promise<Friendship[]> {
    return this.usersFriendshipService.getByUser(userID);
  }

  /**
   * The `requestFriendship` method takes a user id as argument and an instance of 
   * `RequestFriendshipDto`, it then initiates a friendship request based on 
   * `requestFriendshipDto` criterias in behalf of `userID`.
   *
   * @param userID a string representing the guid of a user.
   * @param requestFriendshipDto an instance of `RequestFriendshipDto`.
   */
  @Post('me/friendships')
  async requestFriendship(
    @UserToken('user_id') userID: string,
    @Body() requestFriendshipDto: RequestFriendshipDto,
  ): Promise<void> {
    return this.usersFriendshipService.request(userID, requestFriendshipDto);
  }

  /**
   * The `respondFriendship` method takes a user id, a friendship id, and an instance of
   * `UpdateFriendshipDto` as arguments, it then takes the actions from 
   * `requestFriendshipDto` in behalf of `userID`.
   *
   * @param userID a string representing the guid of a user.
   * @param updateFriendshipDto an instance of `UpdateFriendshipDto`.
   */
  @Patch('me/friendships/:guid')
  async respondFriendship(
    @UserToken('user_id') userID: string,
    @Param('guid') friendshipGUID: string,
    @Body() updateFriendshipDto: UpdateFriendshipDto,
  ): Promise<void> {
    return this.usersFriendshipService.respond(userID, friendshipGUID, updateFriendshipDto);
  }

  /**
   * The `unfriend` method takes a user id and a friendship id as arguments. It then
   * deletes the friendship association in behalf of `userID`.
   *
   * @param userID a string representing the guid of a user.
   * @param updateFriendshipDto an instance of `UpdateFriendshipDto`.
   */
  @Delete('me/friendships/:guid')
  async unfriend(
    @UserToken('user_id') userID: string,
    @Param('guid') friendshipGUID: string,
  ): Promise<void> {
    return this.usersFriendshipService.unfriend(userID, friendshipGUID);
  }
}
