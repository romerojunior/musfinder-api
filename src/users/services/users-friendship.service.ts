import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { Collections } from '../../common/constants';
import { Statuses } from '../../common/enums';
import { UpdateFriendshipDto, RequestFriendshipDto } from '../dto';
import { each, union } from 'lodash';
import { Friendship } from '../models';
import * as firebase from 'firebase-admin';

@Injectable()
export class UsersFriendshipService {
  constructor(private readonly usersService: UsersService) {}

  private fs = firebase.firestore();

  /**
   * The `get` method takes `friendshipGUID` as argument and returns an object
   * representing the friendship entity.
   *
   * @param friendshipGUID a string representing the GUID of a friendship.
   *
   * @returns an instance of `Friendship`.
   *
   * @throws {NotFoundException} if `friendshipGUID` cannot be found.
   */
  async get(friendshipGUID: string): Promise<Friendship> {
    const docRef = this.fs.collection(Collections.FRIENDSHIPS).doc(friendshipGUID);

    const friendshipDoc = await docRef.get();
    if (!friendshipDoc.exists) {
      throw new NotFoundException();
    }

    const data = friendshipDoc.data();
    return <Friendship>{
      guid: docRef.id,
      status: data.status,
      from: data.from,
      to: data.to,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }
  }

  /**
   * The `getByUser` method takes `userGUID` as argument and returns an object
   * representing an array of friendship entities.
   *
   * @param userGUID a string representing the GUID of a user.
   *
   * @returns an array of `Friendship` instances.
   */
  async getByUser(userGUID: string): Promise<Friendship[]> {
    const colRef = this.fs.collection(Collections.FRIENDSHIPS);

    const from = await colRef.where('from', '==', userGUID).get();
    const to = await colRef.where('to', '==', userGUID).get();

    const response: Array<Friendship> = [];

    each(union(from.docs, to.docs), doc => {
      const friendship: any = doc.data();
      const createdAt = <FirebaseFirestore.Timestamp>friendship.createdAt;
      const updatedAt = <FirebaseFirestore.Timestamp>friendship.updatedAt;
      response.push({
        createdAt: createdAt.toDate().toUTCString(),
        updatedAt: updatedAt.toDate().toUTCString(),
        guid: doc.id,
        to: friendship.to,
        from: friendship.from,
        status: friendship.status,
      })
    });

    return response;
  }

  /**
   * The `request` method verifies if both users exist, if so, it will update the
   * collection with a representation of the association.
   *
   * @param fromUserGUID a string representing the GUID of a user.
   * @param toUserGUID a string representing the GUID of a user.
   *
   * @returns {string} a string representing the GUID of the new friendship.
   */
  async request(fromUserGUID: string, requestFriendshipDto: RequestFriendshipDto): Promise<void> {
    await this.usersService.get(fromUserGUID);
    await this.usersService.get(requestFriendshipDto.user);

    const colRef = this.fs.collection(Collections.FRIENDSHIPS);
    const fromTo = await colRef.where('from', '==', fromUserGUID).where('to', '==', requestFriendshipDto.user).get();
    const toFrom = await colRef.where('to', '==', fromUserGUID).where('from', '==', requestFriendshipDto.user).get();

    if (union(fromTo.docs, toFrom.docs).length > 0) {
      throw new ConflictException();
    }

    const now = firebase.firestore.Timestamp.fromDate(new Date());
    const docRef = this.fs.collection(Collections.FRIENDSHIPS).doc();

    await docRef.set({
      from: fromUserGUID,
      to: requestFriendshipDto.user,
      status: Statuses.REQUESTED,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * The `respond` method takes an authenticated userGUID, a friendshipGUID and
   * an updateFriendshipDto as arguments. If the userGUID is the same user who
   * received the friendship invitation, then the `updateFriendshipDto` will be
   * considered, else a `UnauthorizedException` is thrown.
   *
   * @param userGUID a string representing the GUID of a user.
   * @param friendshipGUID a string representing the GUID of a friendship.
   * @param updateFriendshipDto an instance of `UpdateFriendshipDto`.
   *
   * @throws {UnauthorizedException} if it does not match conditions.
   */
  async respond(userGUID: string, friendshipGUID: string, updateFriendshipDto: UpdateFriendshipDto): Promise<void> {
    const now = firebase.firestore.Timestamp.fromDate(new Date());
    const friendship = await this.get(friendshipGUID);

    let update: boolean = (friendship.to == userGUID) && (
        (updateFriendshipDto.status == Statuses.ACCEPTED) ||
        (updateFriendshipDto.status == Statuses.REJECTED)
      )
    if (!update) {
      throw new UnauthorizedException();
    }

    await this.fs.collection(Collections.FRIENDSHIPS)
      .doc(friendshipGUID)
      .update({
        status: updateFriendshipDto.status,
        updatedAt: now,
      });
  }
}
